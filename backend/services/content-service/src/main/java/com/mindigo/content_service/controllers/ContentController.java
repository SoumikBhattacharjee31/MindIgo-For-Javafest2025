package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/content")
@Tag(name = "Content Service", description = "Courses and Tasks")
@Slf4j
@RequiredArgsConstructor
public class ContentController {

    @GetMapping("/test")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        TestResponse test = TestResponse.builder()
                .api("/api/v1/content/test")
                .status("UP")
                .build();
        return ResponseEntity.ok(ApiResponseClass.<TestResponse>builder()
                .success(true)
                .data(test)
                .message("Service is healthy")
                .build());
    }

    @GetMapping("/header-test")
    @Operation(summary = "Test JWT authentication headers")
    public ResponseEntity<ApiResponseClass<Map<String, String>>> testHeader(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-Authenticated", required = false) String authenticated
    ) {
        Map<String, String> response = new HashMap<>();
        response.put("Id", userId != null ? userId : "Not available");
        response.put("Email", userEmail != null ? userEmail : "Not available");
        response.put("Role", userRole != null ? userRole : "Not available");
        response.put("Authenticated", authenticated != null ? authenticated : "false");

        boolean isAuthenticated = "true".equals(authenticated);

        return ResponseEntity.ok(ApiResponseClass.<Map<String, String>>builder()
                .success(true)
                .data(response)
                .message(isAuthenticated ? "Headers from JWT authentication" : "No authentication headers found")
                .build());
    }
}