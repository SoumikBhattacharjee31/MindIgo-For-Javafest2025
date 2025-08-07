package com.mindigo.auth_service.services;

import com.mindigo.auth_service.dto.*;
import com.mindigo.auth_service.exceptions.*;
import com.mindigo.auth_service.models.*;
import com.mindigo.auth_service.repositories.UserOTPRepository;
import com.mindigo.auth_service.repositories.UserRepository;
import com.mindigo.auth_service.repositories.UserTokenRepository;
import com.mindigo.auth_service.utils.*;
import com.mindigo.auth_service.jwt.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    @Value("${app.frontend.domain}")
    private String frontendDomain;

    @Value("${app.jwt.access-token-expiry}")
    private long accessTokenExpiry;

    @Value("${app.jwt.refresh-token-expiry}")
    private long refreshTokenExpiry;

    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;

    @Value("${app.password-reset.expiry-hours}")
    private int passwordResetExpiryHours;

    private final ImageHelper imageStorageService;
    private final UserRepository userRepository;
    private final UserOTPRepository otpRepository;
    private final UserTokenRepository userTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final CookieHelper cookieHelper;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final AuditLogService auditLogService;
    private final PasswordValidatorService passwordValidatorService;

    @Transactional
    public AuthenticationResponse register(MultipartFile profileImage, RegisterRequest request, HttpServletResponse response) {
        String clientIp = getClientIpFromRequest();

        // Rate limiting
        rateLimitService.checkRateLimit("register", request.getEmail(), 3, 3600); // 3 attempts per hour

        log.info("Registration attempt for email: {}", request.getEmail());

        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                auditLogService.logSecurityEvent("REGISTRATION_FAILED", request.getEmail(),
                        "User already exists", clientIp);
                throw new UserAlreadyExistsException("An account with this email already exists");
            }

            // Validate password strength
            passwordValidatorService.validatePassword(request.getPassword());

            // Create user
            User user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail().trim())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.valueOf(request.getRole().toUpperCase()))
                    .dateOfBirth(request.getDateOfBirth())
                    .gender(Gender.valueOf(request.getGender()))
                    .isEmailVerified(false)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            String imageUrl=null;

            // Handle profile image upload asynchronously
            if (profileImage != null && !profileImage.isEmpty()) {
                try {
                    imageUrl = imageStorageService.processUserProfileImageUpload(request.getEmail(), profileImage);
                    log.info("Profile image uploaded for user: {}", request.getEmail());
                } catch (Exception e) {
                    log.error("Failed to upload profile image for user: {}", request.getEmail(), e);
                }
            }

            user.setProfileImageUrl(imageUrl);
            user = userRepository.save(user);

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Set secure cookies
            cookieHelper.setSecureCookie(response, "accessToken", accessToken, accessTokenExpiry);
            cookieHelper.setSecureCookie(response, "refreshToken", refreshToken, refreshTokenExpiry);

            auditLogService.logSecurityEvent("USER_REGISTERED", user.getEmail(),
                    "User registration successful", clientIp);

            log.info("User registered successfully: {}", user.getEmail());

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(UserProfileResponse.fromUser(user))
                    .tokenType("Bearer")
                    .expiresIn(accessTokenExpiry)
                    .build();

        } catch (Exception e) {
            auditLogService.logSecurityEvent("REGISTRATION_FAILED", request.getEmail(),
                    e.getMessage(), clientIp);
            throw e;
        }
    }

    @Transactional
    public AuthenticationResponse authenticateLogin(AuthenticationRequest request,
                                                    HttpServletResponse response,
                                                    HttpServletRequest httpRequest) {
        String clientIp = getClientIpFromHttpRequest(httpRequest);
        String email = request.getEmail().toLowerCase().trim();

        // Rate limiting
        rateLimitService.checkRateLimit("login", email, 5, 900); // 5 attempts per 15 minutes

        log.info("Login attempt for email: {}", email);

        try {
            // Find user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

            // Check if account is active
            if (!user.getIsActive()) {
                auditLogService.logSecurityEvent("LOGIN_FAILED", email,
                        "Account is deactivated", clientIp);
                throw new AccountDeactivatedException("Your account has been deactivated");
            }

            // Authenticate
            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(email, request.getPassword())
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (BadCredentialsException e) {
                auditLogService.logSecurityEvent("LOGIN_FAILED", email,
                        "Invalid credentials", clientIp);
                throw new InvalidCredentialsException("Invalid email or password");
            }

            // Check email verification status
            if (!user.getIsEmailVerified()) {
                auditLogService.logSecurityEvent("LOGIN_FAILED", email,
                        "Email not verified", clientIp);
                throw new EmailNotVerifiedException("Please verify your email address before logging in");
            }

            // Update last login
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            // Generate tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Set secure cookies
            cookieHelper.setSecureCookie(response, "accessToken", accessToken, accessTokenExpiry);
            cookieHelper.setSecureCookie(response, "refreshToken", refreshToken, refreshTokenExpiry);

            auditLogService.logSecurityEvent("LOGIN_SUCCESS", email,
                    "User login successful", clientIp);

            log.info("User logged in successfully: {}", email);

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(UserProfileResponse.fromUser(user))
                    .tokenType("Bearer")
                    .expiresIn(accessTokenExpiry)
                    .build();

        } catch (Exception e) {
            if (!(e instanceof InvalidCredentialsException ||
                    e instanceof EmailNotVerifiedException ||
                    e instanceof AccountDeactivatedException)) {
                auditLogService.logSecurityEvent("LOGIN_FAILED", email,
                        e.getMessage(), clientIp);
            }
            throw e;
        }
    }

    @Transactional
    public String requestOtp(HttpServletRequest request) {
        String email = cookieHelper.getEmailFromCookie(request);
        String clientIp = getClientIpFromHttpRequest(request);

        if (email == null) {
            throw new InvalidTokenException("Invalid session. Please register again.");
        }

        // Rate limiting
        rateLimitService.checkRateLimit("otp_request", email, 3, 3600); // 3 OTP requests per hour

        log.info("OTP request for email: {}", email);

        // Check if user exists and is not verified
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (user.getIsEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        // Check if OTP was already sent recently
        Optional<UserOTP> existingOtp = otpRepository.findByEmailAndExpiryTimeAfter(
                email, LocalDateTime.now().minusMinutes(1));

        if (existingOtp.isPresent()) {
            throw new BadRequestException("Please wait before requesting another OTP");
        }

        // Clean up expired OTPs
        otpRepository.deleteByEmailAndExpiryTimeBefore(email, LocalDateTime.now());

        // Generate and save new OTP
        String otp = OtpGenerator.generateSecureOtp();
        UserOTP userOTP = UserOTP.builder()
                .email(email)
                .otp(passwordEncoder.encode(otp)) // Hash OTP for security
                .expiryTime(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .attempts(0)
                .build();

        otpRepository.save(userOTP);

        // Send OTP email asynchronously
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendOtpEmail(email, user.getName(), otp);
                log.info("OTP email sent to: {}", email);
            } catch (Exception e) {
                log.error("Failed to send OTP email to: {}", email, e);
            }
        });

        auditLogService.logSecurityEvent("OTP_REQUESTED", email,
                "OTP request successful", clientIp);

        return String.format("OTP sent to %s. Please check your email.",
                maskEmail(email));
    }

    @Transactional
    public AuthenticationResponse verifyOtp(OtpVerificationRequest request,
                                            HttpServletRequest httpRequest,
                                            HttpServletResponse response) {
        String email = cookieHelper.getEmailFromCookie(httpRequest);
        String clientIp = getClientIpFromHttpRequest(httpRequest);

        if (email == null) {
            throw new InvalidTokenException("Invalid session. Please register again.");
        }

        // Rate limiting
        rateLimitService.checkRateLimit("otp_verify", email, 5, 3600); // 5 attempts per hour

        log.info("OTP verification attempt for email: {}", email);

        try {
            // Find OTP record
            UserOTP userOTP = otpRepository.findByEmailAndExpiryTimeAfter(email, LocalDateTime.now())
                    .orElseThrow(() -> new InvalidOtpException("Invalid or expired OTP"));

            // Check attempts
            if (userOTP.getAttempts() >= 3) {
                otpRepository.delete(userOTP);
                auditLogService.logSecurityEvent("OTP_VERIFICATION_FAILED", email,
                        "Too many failed attempts", clientIp);
                throw new TooManyAttemptsException("Too many failed attempts. Please request a new OTP.");
            }

            // Verify OTP
            if (!passwordEncoder.matches(request.getOtp(), userOTP.getOtp())) {
                userOTP.setAttempts(userOTP.getAttempts() + 1);
                otpRepository.save(userOTP);
                auditLogService.logSecurityEvent("OTP_VERIFICATION_FAILED", email,
                        "Invalid OTP", clientIp);
                throw new InvalidOtpException("Invalid OTP");
            }

            // Find and update user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            user.setIsEmailVerified(true);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            // Clean up OTP
            otpRepository.delete(userOTP);

            // Generate new tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Set secure cookies
            cookieHelper.setSecureCookie(response, "accessToken", accessToken, accessTokenExpiry);
            cookieHelper.setSecureCookie(response, "refreshToken", refreshToken, refreshTokenExpiry);

            auditLogService.logSecurityEvent("EMAIL_VERIFIED", email,
                    "Email verification successful", clientIp);

            log.info("Email verified successfully: {}", email);

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(UserProfileResponse.fromUser(user))
                    .tokenType("Bearer")
                    .expiresIn(accessTokenExpiry)
                    .build();

        } catch (Exception e) {
            if (!(e instanceof InvalidOtpException ||
                    e instanceof TooManyAttemptsException)) {
                auditLogService.logSecurityEvent("OTP_VERIFICATION_FAILED", email,
                        e.getMessage(), clientIp);
            }
            throw e;
        }
    }

    @Transactional
    public String requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Rate limiting
        rateLimitService.checkRateLimit("password_reset", email, 3, 3600); // 3 requests per hour

        log.info("Password reset requested for email: {}", email);

        // Find user (don't reveal if user exists or not for security)
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Clean up existing tokens
            userTokenRepository.deleteByEmailAndExpiryTimeBefore(email, LocalDateTime.now());

            // Generate secure token
            String token = TokenGenerator.generateSecureToken();

            // Save reset token
            UserToken resetToken = UserToken.builder()
                    .email(email)
                    .token(passwordEncoder.encode(token)) // Hash token for security
                    .tokenType(TokenType.PASSWORD_RESET)
                    .expiryTime(LocalDateTime.now().plusHours(passwordResetExpiryHours))
                    .build();

            userTokenRepository.save(resetToken);

            // Send reset email asynchronously
            CompletableFuture.runAsync(() -> {
                try {
                    String resetUrl = String.format("%s/reset-password?token=%s",
                            frontendDomain, token);
                    emailService.sendPasswordResetEmail(email, user.getName(), resetUrl);
                    log.info("Password reset email sent to: {}", email);
                } catch (Exception e) {
                    log.error("Failed to send password reset email to: {}", email, e);
                }
            });

            auditLogService.logSecurityEvent("PASSWORD_RESET_REQUESTED", email,
                    "Password reset email sent", getClientIpFromRequest());
        }

        // Always return the same message for security
        return String.format("If an account with email %s exists, " +
                "a password reset link has been sent.", maskEmail(email));
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        String token = request.getToken();
        String newPassword = request.getNewPassword();

        log.info("Password reset attempt with token: {}", token.substring(0, 8) + "...");

        // Find valid token
        Optional<UserToken> tokenOptional = userTokenRepository
                .findByTokenTypeAndExpiryTimeAfter(TokenType.PASSWORD_RESET, LocalDateTime.now())
                .stream()
                .filter(t -> passwordEncoder.matches(token, t.getToken()))
                .findFirst();

        if (tokenOptional.isEmpty()) {
            auditLogService.logSecurityEvent("PASSWORD_RESET_FAILED", "UNKNOWN",
                    "Invalid or expired token", getClientIpFromRequest());
            throw new InvalidTokenException("Invalid or expired reset token");
        }

        UserToken resetToken = tokenOptional.get();
        String email = resetToken.getEmail();

        // Validate password
        passwordValidatorService.validatePassword(newPassword);

        // Find and update user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Clean up reset token
        userTokenRepository.delete(resetToken);

        auditLogService.logSecurityEvent("PASSWORD_RESET_SUCCESS", email,
                "Password reset successful", getClientIpFromRequest());

        log.info("Password reset successful for email: {}", email);

        // Send confirmation email
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendPasswordChangeConfirmationEmail(email, user.getName());
            } catch (Exception e) {
                log.error("Failed to send password change confirmation email", e);
            }
        });

        return "Password has been reset successfully";
    }

    public ValidateResponse validateToken(String token) {
        try {
            String userEmail = jwtService.extractUsername(token);
            String userId = jwtService.extractUserId(token);

            if (userEmail == null || userId == null) {
                throw new InvalidTokenException("Invalid token format");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            if (!jwtService.isTokenValid(token, userDetails)) {
                throw new InvalidTokenException("Token is invalid or expired");
            }

            Optional<User> user = userRepository.findByEmail(userEmail);
            if (user.isEmpty()) {
                throw new InvalidTokenException("User not found");
            }
            String role = String.valueOf(user.get().getRole());

            return ValidateResponse.builder()
                    .userId(Long.parseLong(userId))
                    .email(userEmail)
                    .valid(true)
                    .role(role)
                    .build();

        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            throw new InvalidTokenException("Invalid token");
        }
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String email = cookieHelper.getEmailFromCookie(request);

        if (email != null) {
            auditLogService.logSecurityEvent("USER_LOGOUT", email,
                    "User logout", getClientIpFromHttpRequest(request));
            log.info("User logged out: {}", email);
        }

        // Clear cookies
        cookieHelper.clearCookie(response, "accessToken");
        cookieHelper.clearCookie(response, "refreshToken");

        // Clear security context
        SecurityContextHolder.clearContext();
    }

    public AuthenticationResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieHelper.getTokenFromCookie(request, "refreshToken");

        if (refreshToken == null) {
            throw new InvalidTokenException("Refresh token not found");
        }

        try {
            String userEmail = jwtService.extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                throw new InvalidTokenException("Invalid refresh token");
            }

            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));

            // Generate new access token
            String newAccessToken = jwtService.generateAccessToken(user);

            // Set new access token cookie
            cookieHelper.setSecureCookie(response, "accessToken", newAccessToken, accessTokenExpiry);

            return AuthenticationResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken)
                    .user(UserProfileResponse.fromUser(user))
                    .tokenType("Bearer")
                    .expiresIn(accessTokenExpiry)
                    .build();

        } catch (Exception e) {
            log.warn("Token refresh failed: {}", e.getMessage());
            throw new InvalidTokenException("Failed to refresh token");
        }
    }

    public UserProfileResponse getCurrentUserProfile(HttpServletRequest request) {
        String email = cookieHelper.getEmailFromCookie(request);

        if (email == null) {
            throw new InvalidTokenException("Invalid session");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return UserProfileResponse.fromUser(user);
    }

    // Helper methods
    private String getClientIpFromRequest() {
        // This would typically come from a request context or be injected
        return "unknown";
    }

    private String getClientIpFromHttpRequest(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }

        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];

        if (username.length() <= 2) {
            return username.charAt(0) + "*@" + domain;
        }

        return username.charAt(0) + "*".repeat(username.length() - 2) +
                username.charAt(username.length() - 1) + "@" + domain;
    }
}