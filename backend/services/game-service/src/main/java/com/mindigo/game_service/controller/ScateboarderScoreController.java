package com.mindigo.game_service.controller;

import com.mindigo.game_service.dto.request.SaveScoreRequest;
import com.mindigo.game_service.dto.response.ApiResponseClass;
import com.mindigo.game_service.dto.response.ScoreResponse;
import com.mindigo.game_service.service.ScateboarderScoreService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/game/snowboarder")
@RequiredArgsConstructor
public class ScateboarderScoreController {

    private final ScateboarderScoreService scoreService;

    @PostMapping("/save")
    public ResponseEntity<ApiResponseClass<ScoreResponse>> saveScore(
            @RequestBody SaveScoreRequest request,
            HttpServletRequest httpRequest) {

        try {
            // Extract user information from headers
            String userId = httpRequest.getHeader("X-User-Id");
            String userEmail = httpRequest.getHeader("X-User-Email");
            String userRole = httpRequest.getHeader("X-User-Role");
            String authenticated = httpRequest.getHeader("X-Authenticated");

            log.info("=========================================");
            log.info("User Email: {}", userEmail);
            log.info("User ID: {}", userId);
            log.info("User Role: {}", userRole);
            log.info("Authenticated: {}", authenticated);
            log.info("=========================================");

            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.error("User ID not found in request headers", "UNAUTHORIZED"));
            }

            if (!"true".equalsIgnoreCase(authenticated)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.error("User not authenticated", "UNAUTHORIZED"));
            }

            ScoreResponse savedScore = scoreService.saveScore(userId, request);

            return ResponseEntity.ok(
                    ApiResponseClass.success(savedScore, "Score saved successfully")
            );

        } catch (Exception e) {
            log.error("Error saving score", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to save score: " + e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/top10")
    public ResponseEntity<ApiResponseClass<List<ScoreResponse>>> getTop10Scores() {
        try {
            List<ScoreResponse> topScores = scoreService.getTop10Scores();

            return ResponseEntity.ok(
                    ApiResponseClass.success(topScores, "Top 10 scores retrieved successfully")
            );

        } catch (Exception e) {
            log.error("Error fetching top 10 scores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to fetch top scores: " + e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/personal-best")
    public ResponseEntity<ApiResponseClass<ScoreResponse>> getPersonalBest(HttpServletRequest request) {
        System.out.println("YOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
        try {
            String userId = request.getHeader("X-User-Id");
            String authenticated = request.getHeader("X-Authenticated");

            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.error("User ID not found in request headers", "UNAUTHORIZED"));
            }

            if (!"true".equalsIgnoreCase(authenticated)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.error("User not authenticated", "UNAUTHORIZED"));
            }

            Optional<ScoreResponse> personalBest = scoreService.getPersonalBest(userId);

            if (personalBest.isPresent()) {
                return ResponseEntity.ok(
                        ApiResponseClass.success(personalBest.get(), "Personal best retrieved successfully")
                );
            } else {
                return ResponseEntity.ok(
                        ApiResponseClass.success(null, "No personal best found")
                );
            }

        } catch (Exception e) {
            log.error("Error fetching personal best", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to fetch personal best: " + e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/my-scores")
    public ResponseEntity<ApiResponseClass<List<ScoreResponse>>> getMyScores(HttpServletRequest request) {
        try {
            String userId = request.getHeader("X-User-Id");
            String authenticated = request.getHeader("X-Authenticated");

            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.error("User ID not found in request headers", "UNAUTHORIZED"));
            }

            if (!"true".equalsIgnoreCase(authenticated)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseClass.error("User not authenticated", "UNAUTHORIZED"));
            }

            List<ScoreResponse> myScores = scoreService.getPlayerScores(userId);

            return ResponseEntity.ok(
                    ApiResponseClass.success(myScores, "Player scores retrieved successfully")
            );

        } catch (Exception e) {
            log.error("Error fetching player scores", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to fetch player scores: " + e.getMessage(), "INTERNAL_ERROR"));
        }
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<ApiResponseClass<List<ScoreResponse>>> getPlayerScores(@PathVariable String playerId) {
        try {
            List<ScoreResponse> playerScores = scoreService.getPlayerScores(playerId);

            return ResponseEntity.ok(
                    ApiResponseClass.success(playerScores, "Player scores retrieved successfully")
            );

        } catch (Exception e) {
            log.error("Error fetching scores for player: {}", playerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Failed to fetch player scores: " + e.getMessage(), "INTERNAL_ERROR"));
        }
    }
}