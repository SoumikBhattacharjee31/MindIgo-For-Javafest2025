package com.example.mindigo.auth;

import com.example.mindigo.auth.customReqRes.AuthenticationRequest;
import com.example.mindigo.auth.customReqRes.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")

public class AuthenticationController {

    @Autowired
    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("registerRequest") RegisterRequest request,
            HttpServletResponse response
    ){
        return ResponseEntity.ok(service.register(file,request,response));
    }

    @GetMapping("/get-otp")
    public ResponseEntity<String> getOTP(
            HttpServletRequest request, HttpServletResponse response
    ){
        return ResponseEntity.ok(service.getOTP(request,response));
    }

    @PostMapping("/login")
    public ResponseEntity<String> authenticateLogin(
            @RequestBody AuthenticationRequest request, HttpServletResponse response
    ){
        return ResponseEntity.ok(service.authenticateLogin(request, response));
    }

    @PostMapping("/loginOTP")
    public ResponseEntity<String> authenticateLoginOTP(
            @RequestBody AuthenticationRequest request, HttpServletResponse response
    ){
        return ResponseEntity.ok(service.authenticateLoginOTP(request, response));
    }

    @PostMapping("/get-pass")
    public ResponseEntity<String> getPasswordMail(
            @RequestBody AuthenticationRequest request
    ){
        return ResponseEntity.ok(service.getPasswordMail(request));
    }

    @PostMapping("/set-pass")
    public ResponseEntity<String> settPassword(
            @RequestBody AuthenticationRequest request, HttpServletResponse response
    ){
        return ResponseEntity.ok(service.setPassword(request));
    }

}

