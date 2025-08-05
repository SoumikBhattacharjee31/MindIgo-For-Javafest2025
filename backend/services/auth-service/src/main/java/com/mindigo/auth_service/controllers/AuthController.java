package com.mindigo.auth_service.controllers;

import com.mindigo.auth_service.dto.TestResponse;
import com.mindigo.auth_service.services.AuthenticationService;
import com.mindigo.auth_service.dto.AuthenticationRequest;
import com.mindigo.auth_service.dto.RegisterRequest;
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

public class AuthController {

    @Autowired
    private final AuthenticationService service;

    @GetMapping("/test")
    public ResponseEntity<TestResponse> testingPath(){
        TestResponse test = TestResponse
                .builder()
                .api("api/v1/auth/test")
                .status("UP").build();
        return ResponseEntity.ok(test);
    }

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<String> register(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("registerRequest") RegisterRequest request,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(service.register(file, request, response));
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
            @RequestBody AuthenticationRequest request, HttpServletRequest request2, HttpServletResponse response
    ){
        return ResponseEntity.ok(service.authenticateLoginOTP(request, request2, response));
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

    @GetMapping("/hello")
    public ResponseEntity<String> hello() { return ResponseEntity.ok("Hello World"); }

    @GetMapping("/validate")
    public String validate(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid";
    }

}

