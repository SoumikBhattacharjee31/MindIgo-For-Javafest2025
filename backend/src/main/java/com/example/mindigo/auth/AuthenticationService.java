package com.example.mindigo.auth;

import com.example.mindigo.utils.CookieHelper;
import com.example.mindigo.auth.customReqRes.AuthenticationRequest;
import com.example.mindigo.auth.customReqRes.RegisterRequest;
import com.example.mindigo.jwt.JwtService;
import com.example.mindigo.user.*;
import com.example.mindigo.user.repositories.UserRepository;
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

    private final UserRepository repository;

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


}
