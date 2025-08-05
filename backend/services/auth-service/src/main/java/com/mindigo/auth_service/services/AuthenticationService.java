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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final String domain = "http://localhost:3000/";
    private final RestTemplate restTemplate;
    private final ImageHelper imageHelper;
    private final UserRepository repository;
    private final UserOTPRepository otpRepository;
    private final UserTokenRepository userTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final CookieHelper cookieHelper;
    private final MailService mailService;

    // sign up new user
    public String register(MultipartFile file, RegisterRequest request, HttpServletResponse response) {

        // check user already exists or not
        Optional<User> findUser = repository.findByEmail(request.getEmail());
        if(findUser.isPresent())
            return "User Already Exists";

        // create user
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

        // return with token
        var jwtToken = jwtService.generateToken(user);
        CookieHelper.addCookie(response,"jwtToken",jwtToken);
        return "User saved" ;
    }

    // login
    public String authenticateLogin(AuthenticationRequest request, HttpServletResponse response) {

        // check user exists or not
        Optional<User> findUser = repository.findByEmail(request.getEmail());
        if(findUser.isEmpty())
            return "User Not Found";
        User user = findUser.get();

        // login
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // otp validation
        if(!user.getValid())
            return "User not validated through otp";

        // return with token
        var jwtToken = jwtService.generateToken(user);
        CookieHelper.addCookie(response,"jwtToken",jwtToken);
        return "User Successfully Logged in";
    }

    // send otp for login
    public String getOTP(HttpServletRequest request, HttpServletResponse response) {

        // get email
        String userEmail = cookieHelper.getMailFromCookie(request);

        // check otp already sent or not
        var user = otpRepository.findUserByEmail(userEmail);
        if(user!=null)
            return "OTP already sent to "+userEmail;

        // generate and save otp
        int otp = RandomOTPGenerator.generateRandom6DigitNumber();
        var temp = UserOTP.builder()
                        .email(userEmail).otp(otp)
                        .build();
        otpRepository.save(temp);

        // send mail and return
        mailService.sendMail(userEmail, "Registration in Mindigo", "Your OTP: " + otp);
        return "Email Sent to "+userEmail;
    }

    @Transactional
    public String authenticateLoginOTP(AuthenticationRequest request, HttpServletRequest request2, HttpServletResponse response) {

        // get email
        String userEmail = cookieHelper.getMailFromCookie(request2);

        // find otp
        UserOTP userOTP = otpRepository.findUserByEmail(userEmail);
        if(userOTP.getOtp() == null || !userOTP.getOtp().equals(request.getOtp()))
            return "Not matched";

        // make user valid
        User user = repository.findUserByEmail(userEmail);
        user.setValid(true);
        otpRepository.delete(userOTP);

        // return with token
        var jwtToken = jwtService.generateToken(user);
        CookieHelper.addCookie(response,"jwtToken",jwtToken);
        return "Successfully Validated";
    }

    // get link for changing password
    public String getPasswordMail(AuthenticationRequest request) {

        // check user exists or not
        var userEmail = request.getEmail();
        var user = repository.findUserByEmail(userEmail);
        if(user==null)
            return "The email is not registered";

        // create link
        String token = RandomStringGenerator.generateRandomString(20);
        String mailMessage = "Set your password following the link: "+domain+"set-password?token="+token;
        var temp = UserToken.builder()
                .email(userEmail)
                .token(token)
                .build();
        userTokenRepository.save(temp);

        // return with mail
        mailService.sendMail(userEmail, "Passoword reset link of your Mindigo account", mailMessage);
        return "Email Sent";
    }

    // set new password
    @Transactional
    public String setPassword(AuthenticationRequest request) {

        // check token validity
        String token = request.getEmail();
        UserToken userToken = userTokenRepository.findUserByToken(token);
        if(userToken == null)
            return "Invalid Token";

        // find and set user password
        var user = repository.findUserByEmail(userToken.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userTokenRepository.delete(userToken);
        return "Password Reset Done";
    }

    // check if token is valid or not
    public void validateToken(String token) {
        String userEmail = jwtService.extractUsername(token);
        if (userEmail != null && !userEmail.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            jwtService.isTokenValid(token, userDetails);
        }
    }
}
