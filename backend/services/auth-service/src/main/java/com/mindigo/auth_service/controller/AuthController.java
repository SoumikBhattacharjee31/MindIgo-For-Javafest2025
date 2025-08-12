package com.mindigo.auth_service.controller;

import com.mindigo.auth_service.dto.request.*;
import com.mindigo.auth_service.dto.response.*;
import com.mindigo.auth_service.services.AuthenticationService;
import com.mindigo.auth_service.validators.AuthValidationGroups;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
@Slf4j
@Validated
public class AuthController {

    private final AuthenticationService authenticationService;

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<ApiResponseClass<TestResponse>> healthCheck() {
        TestResponse test = TestResponse.builder()
                .api("api/v1/auth/health")
                .status("UP")
                .timestamp(System.currentTimeMillis())
                .build();

        return ResponseEntity.ok(ApiResponseClass.<TestResponse>builder()
                .success(true)
                .data(test)
                .message("Service is healthy")
                .build());
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Register a new user")
    @ApiResponse(responseCode = "201", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    @ApiResponse(responseCode = "409", description = "User already exists")
    public ResponseEntity<ApiResponseClass<AuthenticationResponse>> register(
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestPart("user") @Validated(AuthValidationGroups.Registration.class) RegisterRequest request,
            HttpServletResponse response) {

        log.info("Registration attempt for email: {}", request.getEmail());

        AuthenticationResponse authResponse = authenticationService.register(profileImage, request, response);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.<AuthenticationResponse>builder()
                        .success(true)
                        .data(authResponse)
                        .message("User registered successfully")
                        .build());
    }

    @PostMapping("/request-otp")
    @Operation(summary = "Request OTP for account validation")
    public ResponseEntity<ApiResponseClass<Void>> requestOtp(
            HttpServletRequest request) {

        String result = authenticationService.requestOtp(request);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message(result)
                .build());
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user login")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    @ApiResponse(responseCode = "403", description = "Account not validated")
    public ResponseEntity<ApiResponseClass<AuthenticationResponse>> login(
            @RequestBody @Validated(AuthValidationGroups.Login.class) AuthenticationRequest request,
            HttpServletResponse response,
            HttpServletRequest httpRequest) {

        log.info("Login attempt for email: {}", request.getEmail());

        AuthenticationResponse authResponse = authenticationService.authenticateLogin(request, response, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<AuthenticationResponse>builder()
                .success(true)
                .data(authResponse)
                .message("Login successful")
                .build());
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and complete registration")
    public ResponseEntity<ApiResponseClass<AuthenticationResponse>> verifyOtp(
            @RequestBody @Validated(AuthValidationGroups.OtpVerification.class) OtpVerificationRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        AuthenticationResponse authResponse = authenticationService.verifyOtp(request, httpRequest, response);

        return ResponseEntity.ok(ApiResponseClass.<AuthenticationResponse>builder()
                .success(true)
                .data(authResponse)
                .message("OTP verified successfully")
                .build());
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset link")
    public ResponseEntity<ApiResponseClass<Void>> forgotPassword(
            @RequestBody @Validated(AuthValidationGroups.ForgotPassword.class) ForgotPasswordRequest request) {

        log.info("Password reset requested for email: {}", request.getEmail());

        String result = authenticationService.requestPasswordReset(request);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message(result)
                .build());
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ResponseEntity<ApiResponseClass<Void>> resetPassword(
            @RequestBody @Validated(AuthValidationGroups.PasswordReset.class) ResetPasswordRequest request) {

        String result = authenticationService.resetPassword(request);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message(result)
                .build());
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponseClass<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        authenticationService.logout(request, response);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Logged out successfully")
                .build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh authentication token")
    public ResponseEntity<ApiResponseClass<AuthenticationResponse>> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {

        AuthenticationResponse authResponse = authenticationService.refreshToken(request, response);

        return ResponseEntity.ok(ApiResponseClass.<AuthenticationResponse>builder()
                .success(true)
                .data(authResponse)
                .message("Token refreshed successfully")
                .build());
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token")
    public ResponseEntity<ApiResponseClass<ValidateResponse>> validateToken(
            @RequestParam("token") String token) {

        ValidateResponse validation = authenticationService.validateToken(token);

        return ResponseEntity.ok(ApiResponseClass.<ValidateResponse>builder()
                .success(true)
                .data(validation)
                .message("Token is valid")
                .build());
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponseClass<UserProfileResponse>> getCurrentUser(
            HttpServletRequest request) {

        UserProfileResponse profile = authenticationService.getCurrentUserProfile(request);

        return ResponseEntity.ok(ApiResponseClass.<UserProfileResponse>builder()
                .success(true)
                .data(profile)
                .message("Profile retrieved successfully")
                .build());
    }

    // Add this endpoint to your existing AuthController class

    @PostMapping(value = "/register-counselor", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Register a new counselor (requires admin approval)")
    @ApiResponse(responseCode = "201", description = "Counselor registration submitted successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    @ApiResponse(responseCode = "409", description = "User already exists")
    public ResponseEntity<ApiResponseClass<String>> registerCounselor(
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestPart(value = "verificationDocument") MultipartFile verificationDocument,
            @RequestPart("counselor") @Validated(AuthValidationGroups.CounselorRegistration.class) CounselorRegisterRequest request) {

        log.info("Counselor registration attempt for email: {}", request.getEmail());

        String result = authenticationService.registerCounselor(profileImage, verificationDocument, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.<String>builder()
                        .success(true)
                        .data(result)
                        .message("Counselor registration submitted successfully. Awaiting admin approval.")
                        .build());
    }

    @GetMapping("/counselor-status")
    @Operation(summary = "Get counselor verification status")
    public ResponseEntity<ApiResponseClass<CounselorStatusResponse>> getCounselorStatus(
            HttpServletRequest request) {

        CounselorStatusResponse status = authenticationService.getCounselorStatus(request);

        return ResponseEntity.ok(ApiResponseClass.<CounselorStatusResponse>builder()
                .success(true)
                .data(status)
                .message("Counselor status retrieved successfully")
                .build());
    }
}