package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.*;
import com.mindigo.content_service.services.ContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content")
@Tag(name = "Content Service", description = "Courses and Tasks")
@Slf4j
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/test")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        TestResponse test = TestResponse.builder()
                .api("/api/v1/content/test")
                .status("UP")
                .build();
        return ResponseEntity.ok(ApiResponseClass.<TestResponse>builder()
                .success(true)
//                .data(test)
                .message("Service is healthy")
                .build());
    }
}