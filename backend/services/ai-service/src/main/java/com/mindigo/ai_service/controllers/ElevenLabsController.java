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
import java.util.List;

@RestController
@RequestMapping("/api/v1/ai/eleven-labs")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ElevenLabsController {

    private final ElevenLabsService elevenLabsService;

    @GetMapping("/voices")
    public ResponseEntity<ApiResponseClass<List<Voice>>> getVoices() {
        try {
            List<Voice> voices = elevenLabsService.getVoices();
            return ResponseEntity.ok(
                    ApiResponseClass.success(voices, "Voices retrieved successfully")
            );
        } catch (Exception e) {
            log.error("Error retrieving voices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to retrieve voices", "VOICES_FETCH_ERROR"));
        }
    }

    @GetMapping("/voices/options")
    public ResponseEntity<ApiResponseClass<List<VoiceOption>>> getVoiceOptions() {
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

    @GetMapping("/voices/categories")
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

    @GetMapping("/voices/{voiceId}")
    public ResponseEntity<ApiResponseClass<Voice>> getVoiceById(@PathVariable String voiceId) {
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
            headers.set("Content-Disposition", "attachment; filename=\""+request.getFileName()+".mp3\"");

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

    @PatchMapping("/refresh-voices")
    public ResponseEntity<ApiResponseClass<String>> refreshVoices(
            @RequestHeader("X-User-Role") String role
    ) {
        if(!role.equalsIgnoreCase("ADMIN")){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseClass.error("Users must be admin", "UNAUTHORIZED"));
        }
        try {
            elevenLabsService.refreshVoices();
            return ResponseEntity.ok(
                    ApiResponseClass.success("Voices refreshed successfully", "Voices refreshed successfully")
            );
        } catch (Exception e) {
            log.error("Error refreshing voices", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to refresh voices", "VOICES_REFRESH_ERROR"));
        }
    }

}