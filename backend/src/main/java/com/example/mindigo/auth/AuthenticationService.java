package com.example.mindigo.auth;

import com.example.mindigo.utils.*;
import com.example.mindigo.auth.customReqRes.AuthenticationRequest;
import com.example.mindigo.auth.customReqRes.RegisterRequest;
import com.example.mindigo.jwt.JwtService;
import com.example.mindigo.user.*;
import com.example.mindigo.user.repositories.UserOTPRepository;
import com.example.mindigo.user.repositories.UserRepository;
import com.example.mindigo.user.repositories.UserTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final String domain = "http://localhost:3000/";

    @Autowired
    private EmailSenderService senderService;

    @Autowired
    private ImageHelper imageHelper;

    private final UserRepository repository;

    private final UserOTPRepository otpRepository;

    private final UserTokenRepository userTokenRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        var user = otpRepository.findUserByEmail(userEmail);
        if(user!=null){
            return "OTP already sent to "+userEmail;
        }
        int otp = RandomOTPGenerator.generateRandom6DigitNumber();
        var temp = UserOTP.builder()
                        .email(userEmail).otp(otp)
                        .build();
        otpRepository.save(temp);
        try {
            senderService.sendEmail(userEmail,
                    "Registration in mindigo",
                    "Your OTP: "+ otp);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        System.out.println(userEmail);
        return "Email Sent to "+userEmail;
    }

    @Transactional
    public String authenticateLoginOTP(AuthenticationRequest request, HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
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
        try {
            senderService.sendEmail(request.getEmail(),
                    "Password Reset Link",
                    mailMessage);
        } catch (Exception e) {
            throw new RuntimeException(e);
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


}
