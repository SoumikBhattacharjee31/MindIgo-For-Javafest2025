package com.mindigo.ai_service.controllers;

import com.mindigo.ai_service.dto.ApiResponseClass;
import com.mindigo.ai_service.dto.TestResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    @GetMapping("/test")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        TestResponse test = TestResponse.builder()
                .api("/api/v1/ai/test")
                .status("UP")
                .build();
        return ResponseEntity.ok(ApiResponseClass.<TestResponse>builder()
                .success(true)
                .data(test)
                .message("Service is healthy")
                .build());
    }

}
