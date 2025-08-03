package com.mindigo.auth_service.controllers;

import com.mindigo.auth_service.dto.TestResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @GetMapping("/test")
    public ResponseEntity<TestResponse> testingPath(){
        TestResponse test = TestResponse
                .builder()
                .api("api/v1/auth/test")
                .status("UP").build();
        return ResponseEntity.ok(test);
    }
}
