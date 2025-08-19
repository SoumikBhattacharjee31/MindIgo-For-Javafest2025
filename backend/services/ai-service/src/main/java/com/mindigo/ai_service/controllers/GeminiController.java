package com.mindigo.ai_service.controllers;

import com.mindigo.ai_service.dto.ApiResponseClass;
import com.mindigo.ai_service.dto.gemini.GeminiTextRequest;
import com.mindigo.ai_service.services.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/ai/gemini")
@RequiredArgsConstructor
public class GeminiController {
    private final GeminiService geminiService;

    @PostMapping("/text")
    public ResponseEntity<ApiResponseClass<String>> sendText(@Valid @RequestBody GeminiTextRequest request) {
        try {
            String response = geminiService.sendTextToGemini(request);
            return ResponseEntity.ok(ApiResponseClass.<String>builder()
                    .data(response)
                    .success(true)
                    .message("Successful Request")
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "BAD_REQUEST"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponseClass.error(e.getMessage(), "SERVICE_UNAVAILABLE"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error(e.getMessage(), "INTERNAL_SERVER_ERROR"));
        }
    }
}