package com.mindigo.auth_service.services;

import com.mindigo.auth_service.dto.MailSendRequest;
import com.mindigo.auth_service.dto.MailSendResponse;
import com.mindigo.auth_service.models.Role;
import com.mindigo.auth_service.models.User;
import com.mindigo.auth_service.models.UserOTP;
import com.mindigo.auth_service.models.UserToken;
import com.mindigo.auth_service.utils.*;
import com.mindigo.auth_service.dto.AuthenticationRequest;
import com.mindigo.auth_service.dto.RegisterRequest;
import com.mindigo.auth_service.jwt.JwtService;
import com.mindigo.auth_service.repositories.UserOTPRepository;
import com.mindigo.auth_service.repositories.UserRepository;
import com.mindigo.auth_service.repositories.UserTokenRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final String domain = "http://localhost:3000/";

//    @Autowired
//    private EmailSenderService senderService;

    private final RestTemplate restTemplate;

    private final ImageHelper imageHelper;

    private final UserRepository repository;

    private final UserOTPRepository otpRepository;

    private final UserTokenRepository userTokenRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public String register(MultipartFile file, RegisterRequest request, HttpServletResponse response) {

        Optional<User> findUser = repository.findByEmail(request.getEmail());
        if(findUser.isPresent())
            return "User Already Exists";
        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.valueOf(request.getRole()))
                .dob(request.getDob())
                .gender(request.getGender())
                .valid(false)
                .build();
        repository.save(user);

        imageHelper.setImage(user.getEmail(), file);

        var jwtToken = jwtService.generateToken(user);
        CookieHelper.addCookie(response,"jwtToken",jwtToken);
        return "User saved" ;
    }

    public String authenticateLogin(AuthenticationRequest request, HttpServletResponse response) {
        var user = repository.findByEmail(request.getEmail())
                .orElse(null);
        if(user == null)
            return "User Not Found";
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        if(!user.getValid())
            return "User not validated through otp";
        var jwtToken = jwtService.generateToken(user);
        CookieHelper.addCookie(response,"jwtToken",jwtToken);
        return "User Successfully Logged in";
    }

    public String getOTP(HttpServletRequest request, HttpServletResponse response) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String userEmail = authentication.getName();
        Cookie[] cookies = request.getCookies();
        Cookie jwtCookie = Arrays.stream(cookies)
                .filter(cookie -> "jwtToken".equals(cookie.getName()))
                .findFirst()
                .orElse(null);
        System.out.println(jwtCookie);
        String jwt, userEmail;
        if (jwtCookie != null) {
            jwt = jwtCookie.getValue();
            userEmail = jwtService.extractUsername(jwt);
        }
        else throw new RuntimeException("no jwtToken cookie found");


        var user = otpRepository.findUserByEmail(userEmail);
        if(user!=null){
            return "OTP already sent to "+userEmail;
        }
        int otp = RandomOTPGenerator.generateRandom6DigitNumber();
        var temp = UserOTP.builder()
                        .email(userEmail).otp(otp)
                        .build();
        otpRepository.save(temp);




//        try {
//            senderService.sendEmail(userEmail,
//                    "Registration in mindigo",
//                    "Your OTP: "+ otp);
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
        try {
            MailSendRequest mailRequest = new MailSendRequest(
                    userEmail,
                    "Registration in Mindigo",
                    "Your OTP: " + otp
            );
            System.out.println(mailRequest);
            String mailServiceUrl = "http://MAIL-SERVICE/api/v1/mail/send-mail"; // Adjust to your mail-service URL
            ResponseEntity<MailSendResponse> mailResponse = restTemplate.postForEntity(
                    mailServiceUrl,
                    mailRequest,
                    MailSendResponse.class
            );

            if (mailResponse.getStatusCode() != HttpStatus.OK || mailResponse.getBody() == null) {
                throw new RuntimeException("Failed to send email: Invalid response from mail-service");
            }
            if (mailResponse.getBody().getStatus().startsWith("Failed")) {
                throw new RuntimeException("Failed to send email: " + mailResponse.getBody().getStatus());
            }
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with mail-service: " + e.getMessage());
        }




        System.out.println(userEmail);
        return "Email Sent to "+userEmail;
    }

    @Transactional
    public String authenticateLoginOTP(AuthenticationRequest request, HttpServletRequest request2, HttpServletResponse response) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String userEmail = authentication.getName();

        Cookie[] cookies = request2.getCookies();
        Cookie jwtCookie = Arrays.stream(cookies)
                .filter(cookie -> "jwtToken".equals(cookie.getName()))
                .findFirst()
                .orElse(null);
        System.out.println(jwtCookie);
        String jwt, userEmail;
        if (jwtCookie != null) {
            jwt = jwtCookie.getValue();
            userEmail = jwtService.extractUsername(jwt);
        }
        else throw new RuntimeException("no jwtToken cookie found");



        UserOTP userOTP = otpRepository.findUserByEmail(userEmail);
        if(userOTP.getOtp() == null || !userOTP.getOtp().equals(request.getOtp()))
        {
            return "Not matched";
        }
        User user = repository.findUserByEmail(userEmail);
        user.setValid(true);
        otpRepository.delete(userOTP);
        var jwtToken = jwtService.generateToken(user);
        CookieHelper.addCookie(response,"jwtToken",jwtToken);
        return "Successfully Validated";
    }

    public String getPasswordMail(AuthenticationRequest request) {
        var userEmail = request.getEmail();
        var user = repository.findUserByEmail(userEmail);
        if(user==null){
            return "The email is not registered";
        }
        String token = RandomStringGenerator.generateRandomString(20);
        String mailMessage = "Set your password following the link: "+domain+"set-password?token="+token;
        var temp = UserToken.builder()
                .email(userEmail)
                .token(token)
                .build();
        userTokenRepository.save(temp);
//        try {
//            senderService.sendEmail(request.getEmail(),
//                    "Password Reset Link",
//                    mailMessage);
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
        try {
            MailSendRequest mailRequest = new MailSendRequest(
                    userEmail,
                    "Passoword reset link of your Mindigo account",
                    mailMessage
            );
            System.out.println("mail sent");
            String mailServiceUrl = "http://MAIL-SERVICE/api/v1/mail/send-mail"; // Adjust to your mail-service URL
            ResponseEntity<MailSendResponse> mailResponse = restTemplate.postForEntity(
                    mailServiceUrl,
                    mailRequest,
                    MailSendResponse.class
            );

            if (mailResponse.getStatusCode() != HttpStatus.OK || mailResponse.getBody() == null) {
                throw new RuntimeException("Failed to send email: Invalid response from mail-service");
            }
            if (mailResponse.getBody().getStatus().startsWith("Failed")) {
                throw new RuntimeException("Failed to send email: " + mailResponse.getBody().getStatus());
            }
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with mail-service: " + e.getMessage());
        }




        return "Email Sent";
    }

    @Transactional
    public String setPassword(AuthenticationRequest request) {
        String token = request.getEmail();
        UserToken userToken = userTokenRepository.findUserByToken(token);
        if(userToken == null)
            return "Invalid Token";
        var user = repository.findUserByEmail(userToken.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userTokenRepository.delete(userToken);
        return "Password Reset Done";
    }


    public void validateToken(String token) {
        String userEmail = jwtService.extractUsername(token);
        if (userEmail != null && !userEmail.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            jwtService.isTokenValid(token, userDetails);
        }
    }
}
