package com.mindigo.ai_service.controllers;

import com.mindigo.ai_service.dto.*;
import com.mindigo.ai_service.dto.elevenlabs.*;
import com.mindigo.ai_service.services.ElevenLabsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/ai/eleven-labs")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ElevenLabsController {

    private final ElevenLabsService elevenLabsService;

    // Main paginated voices endpoint
    @GetMapping("/voices")
    public ResponseEntity<ApiResponseClass<PagedResult<Voice>>> getVoices(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String category) {
        try {
            PagedResult<Voice> result = (category != null && !category.trim().isEmpty())
                    ? elevenLabsService.getVoicesByCategoryPaged(category.trim(), page, size)
                    : elevenLabsService.getVoicesPaged(page, size);

            return ResponseEntity.ok(
                    ApiResponseClass.success(result, "Voices retrieved successfully")
            );
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "INVALID_PARAMS"));
        } catch (Exception e) {
            log.error("Error retrieving voices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve voices", "VOICES_FETCH_ERROR"));
        }
    }

    // Legacy endpoint for backward compatibility
    @GetMapping("/voices/all")
    @Deprecated
    public ResponseEntity<ApiResponseClass<List<Voice>>> getAllVoices() {
        try {
            List<Voice> voices = elevenLabsService.getVoices();
            return ResponseEntity.ok(
                    ApiResponseClass.success(voices, "All voices retrieved successfully")
            );
        } catch (Exception e) {
            log.error("Error retrieving all voices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve voices", "VOICES_FETCH_ERROR"));
        }
    }

    // Voice options with pagination
    @GetMapping("/voices/options")
    public ResponseEntity<ApiResponseClass<PagedResult<VoiceOption>>> getVoiceOptions(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        try {
            PagedResult<VoiceOption> options = elevenLabsService.getVoiceOptionsPaged(page, size);
            return ResponseEntity.ok(
                    ApiResponseClass.success(options, "Voice options retrieved successfully")
            );
        } catch (Exception e) {
            log.error("Error retrieving voice options", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve voice options", "VOICE_OPTIONS_ERROR"));
        }
    }

    // Legacy voice options endpoint
    @GetMapping("/voices/options/all")
    @Deprecated
    public ResponseEntity<ApiResponseClass<List<VoiceOption>>> getAllVoiceOptions() {
        try {
            List<VoiceOption> options = elevenLabsService.getVoiceOptions();
            return ResponseEntity.ok(
                    ApiResponseClass.success(options, "Voice options retrieved successfully")
            );
        } catch (Exception e) {
            log.error("Error retrieving voice options", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve voice options", "VOICE_OPTIONS_ERROR"));
        }
    }

    // Available categories
    @GetMapping("/voices/categories")
    public ResponseEntity<ApiResponseClass<Set<String>>> getAvailableCategories() {
        try {
            Set<String> categories = elevenLabsService.getAvailableCategories();
            return ResponseEntity.ok(
                    ApiResponseClass.success(categories, "Categories retrieved successfully")
            );
        } catch (Exception e) {
            log.error("Error retrieving categories", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve categories", "CATEGORIES_FETCH_ERROR"));
        }
    }

    // Legacy categorized voices endpoint
    @GetMapping("/voices/categories/detailed")
    @Deprecated
    public ResponseEntity<ApiResponseClass<CategorizedVoices>> getVoicesByCategory() {
        try {
            CategorizedVoices categorizedVoices = elevenLabsService.getVoicesByCategory();
            return ResponseEntity.ok(
                    ApiResponseClass.success(categorizedVoices, "Categorized voices retrieved successfully")
            );
        } catch (Exception e) {
            log.error("Error retrieving categorized voices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve categorized voices", "CATEGORIZED_VOICES_ERROR"));
        }
    }

    // Get voice by ID
    @GetMapping("/voices/{voiceId}")
    public ResponseEntity<ApiResponseClass<Voice>> getVoiceById(
            @PathVariable @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Invalid voice ID format") String voiceId) {
        try {
            return elevenLabsService.getVoiceById(voiceId)
                    .map(voice -> ResponseEntity.ok(
                            ApiResponseClass.success(voice, "Voice retrieved successfully")))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(ApiResponseClass.error("Voice not found", "VOICE_NOT_FOUND")));
        } catch (Exception e) {
            log.error("Error retrieving voice by ID: {}", voiceId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve voice", "VOICE_FETCH_ERROR"));
        }
    }

    // Search voices with pagination
    @GetMapping("/voices/search")
    public ResponseEntity<ApiResponseClass<PagedResult<Voice>>> searchVoices(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponseClass.error("Search query cannot be empty", "EMPTY_QUERY"));
            }

            PagedResult<Voice> result = elevenLabsService.searchVoicesPaged(query.trim(), page, size);
            return ResponseEntity.ok(
                    ApiResponseClass.success(result, "Search completed successfully")
            );
        } catch (Exception e) {
            log.error("Error searching voices with query: {}", query, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Search failed", "SEARCH_ERROR"));
        }
    }

    // Voice statistics
    @GetMapping("/voices/stats")
    public ResponseEntity<ApiResponseClass<VoiceStats>> getVoiceStats() {
        try {
            VoiceStats stats = elevenLabsService.getVoiceStats();
            return ResponseEntity.ok(
                    ApiResponseClass.success(stats, "Voice statistics retrieved successfully")
            );
        } catch (Exception e) {
            log.error("Error retrieving voice statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve statistics", "STATS_ERROR"));
        }
    }

    // Text-to-speech generation
    @PostMapping("/generate")
    public ResponseEntity<?> generateSpeech(@Valid @RequestBody TTSRequest request) {
        try {
            log.info("Generating speech for voice: {}, text length: {}",
                    request.getVoiceId(), request.getText().length());

            byte[] audioData = elevenLabsService.textToSpeech(request);

            if (audioData == null || audioData.length == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponseClass.error("Generated audio is empty", "EMPTY_AUDIO"));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
            headers.setContentLength(audioData.length);
            headers.set("Content-Disposition", "attachment; filename=\"" + request.getFileName() + ".mp3\"");

            return new ResponseEntity<>(audioData, headers, HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for TTS generation", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error(e.getMessage(), "INVALID_VOICE_ID"));
        } catch (Exception e) {
            log.error("Error generating speech", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to generate speech", "TTS_GENERATION_ERROR"));
        }
    }

    // Admin endpoints
    @PatchMapping("/refresh-voices")
    public ResponseEntity<ApiResponseClass<String>> refreshVoices(
            @RequestHeader("X-User-Role") String role) {

        if (!role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Admin access required", "INSUFFICIENT_PERMISSIONS"));
        }

        try {
            elevenLabsService.refreshVoices();
            return ResponseEntity.ok(
                    ApiResponseClass.success("Voices refreshed successfully", "Voices cache updated from API")
            );
        } catch (Exception e) {
            log.error("Error refreshing voices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to refresh voices", "VOICES_REFRESH_ERROR"));
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<ApiResponseClass<Map<String, Object>>> healthCheck() {
        try {
            boolean isHealthy = elevenLabsService.isHealthy();
            Map<String, Object> status = elevenLabsService.getRepositoryStatus();

            if (isHealthy) {
                return ResponseEntity.ok(
                        ApiResponseClass.success(status, "Service is healthy")
                );
            } else {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(ApiResponseClass.error("Service is not healthy", "UNHEALTHY_SERVICE"));
            }
        } catch (Exception e) {
            log.error("Error checking health", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Health check failed", "HEALTH_CHECK_ERROR"));
        }
    }

    // Batch operations endpoint
    @PostMapping("/voices/validate")
    public ResponseEntity<ApiResponseClass<Map<String, Boolean>>> validateVoiceIds(
            @RequestBody List<String> voiceIds) {
        try {
            if (voiceIds == null || voiceIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponseClass.error("Voice IDs list cannot be empty", "EMPTY_VOICE_IDS"));
            }

            Map<String, Boolean> validationResults = voiceIds.stream()
                    .collect(java.util.stream.Collectors.toMap(
                            id -> id,
                            id -> elevenLabsService.getVoiceById(id).isPresent()
                    ));

            return ResponseEntity.ok(
                    ApiResponseClass.success(validationResults, "Voice validation completed")
            );
        } catch (Exception e) {
            log.error("Error validating voice IDs", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Voice validation failed", "VALIDATION_ERROR"));
        }
    }

    // Exception handlers
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<ApiResponseClass<String>> handleValidationException(
            jakarta.validation.ConstraintViolationException e) {
        log.warn("Validation error: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error("Invalid request parameters", "VALIDATION_ERROR"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponseClass<String>> handleIllegalArgument(IllegalArgumentException e) {
        log.warn("Invalid argument: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(e.getMessage(), "INVALID_ARGUMENT"));
    }
}