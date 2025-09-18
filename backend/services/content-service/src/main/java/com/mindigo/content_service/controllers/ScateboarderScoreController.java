package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.game.SaveScoreRequest;
import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.game.ScoreResponse;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.services.ScateboarderScoreService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/content/snowboarder")
@RequiredArgsConstructor
public class ScateboarderScoreController {
    private static final Logger logger = LoggerFactory.getLogger(ScateboarderScoreController.class);

    private final ScateboarderScoreService scoreService;

    private static final String USER_ROLE = "USER";
    private static final String UNAUTHORIZED_MESSAGE = "Access denied: USER role required";
    private static final String INVALID_USER_ID_MESSAGE = "Invalid user ID format";
    private static final String USER_NOT_AUTHENTICATED = "User not authenticated";

    // ============ Utility Methods ============

    private Long parseUserId(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (NumberFormatException e) {
            log.warn("Invalid user ID format: {}", userId);
            throw new InvalidRequestException(INVALID_USER_ID_MESSAGE);
        }
    }

    private void validateUserRole(String role) {
        if (role != null && !USER_ROLE.equalsIgnoreCase(role)) {
            log.warn("Unauthorized access attempt with role: {}", role);
            throw new InvalidRequestException(UNAUTHORIZED_MESSAGE);
        }
    }

    private void validateAuthentication(String authenticated) {
        if (!"true".equalsIgnoreCase(authenticated)) {
            log.warn("Unauthorized access attempt - not authenticated");
            throw new InvalidRequestException(USER_NOT_AUTHENTICATED);
        }
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("User ID not found in request headers");
            throw new InvalidRequestException("User ID not found in request headers");
        }
    }

    private <T> ResponseEntity<ApiResponseClass<T>> executeWithErrorHandling(
            String userId, String role, String authenticated, ServiceOperation<T> operation, String successMessage) {

        validateUserId(userId);
        validateAuthentication(authenticated);
        validateUserRole(role);

        T result = operation.execute(userId);

        return ResponseEntity.ok(ApiResponseClass.success(result, successMessage));
    }

    private <T> ResponseEntity<ApiResponseClass<T>> executeWithoutAuth(
            ServiceOperation<T> operation, String successMessage) {

        T result = operation.execute(null);
        return ResponseEntity.ok(ApiResponseClass.success(result, successMessage));
    }

    @FunctionalInterface
    private interface ServiceOperation<T> {
        T execute(String userId);
    }

    // ============ API Endpoints ============

    @PostMapping("/save")
    public ResponseEntity<ApiResponseClass<ScoreResponse>> saveScore(
            @Valid @RequestBody SaveScoreRequest request,
            HttpServletRequest httpRequest) {

        String userId = httpRequest.getHeader("X-User-Id");
        String userEmail = httpRequest.getHeader("X-User-Email");
        String userRole = httpRequest.getHeader("X-User-Role");
        String authenticated = httpRequest.getHeader("X-Authenticated");

        log.info("Score save request - User ID: {}, Email: {}, Role: {}, Authenticated: {}",
                userId, userEmail, userRole, authenticated);

        return executeWithErrorHandling(
                userId, userRole, authenticated,
                uid -> scoreService.saveScore(uid, request),
                "Score saved successfully"
        );
    }

    @GetMapping("/top10")
    public ResponseEntity<ApiResponseClass<List<ScoreResponse>>> getTop10Scores() {
        return executeWithoutAuth(
                uid -> scoreService.getTop10Scores(),
                "Top 10 scores retrieved successfully"
        );
    }

    @GetMapping("/personal-best")
    public ResponseEntity<ApiResponseClass<ScoreResponse>> getPersonalBest(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        String authenticated = request.getHeader("X-Authenticated");
        String userRole = request.getHeader("X-User-Role");

        return executeWithErrorHandling(
                userId, userRole, authenticated,
                uid -> {
                    Optional<ScoreResponse> personalBest = scoreService.getPersonalBest(uid);
                    return personalBest.orElse(null);
                },
                "Personal best retrieved successfully"
        );
    }

    @GetMapping("/my-scores")
    public ResponseEntity<ApiResponseClass<List<ScoreResponse>>> getMyScores(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        String authenticated = request.getHeader("X-Authenticated");
        String userRole = request.getHeader("X-User-Role");

        return executeWithErrorHandling(
                userId, userRole, authenticated,
                scoreService::getPlayerScores,
                "Player scores retrieved successfully"
        );
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<ApiResponseClass<List<ScoreResponse>>> getPlayerScores(@PathVariable String playerId) {
        return executeWithoutAuth(
                uid -> scoreService.getPlayerScores(playerId),
                "Player scores retrieved successfully"
        );
    }

    // ============ Exception Handlers ============

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidRequest(InvalidRequestException e) {
        log.error("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(e.getMessage(), "400"));
    }

    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleNumberFormatException(NumberFormatException e) {
        log.error("Number format exception: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(INVALID_USER_ID_MESSAGE, "400"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseClass<Void>> handleGenericException(Exception e) {
        log.error("Unexpected error in skateboard score controller", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred", "500"));
    }
}
