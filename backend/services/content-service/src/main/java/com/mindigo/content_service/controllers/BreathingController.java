package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.breathing.BreathingResponse;
import com.mindigo.content_service.dto.breathing.BreathingSessionRequest;
import com.mindigo.content_service.dto.breathing.BreathingSessionResponse;
import com.mindigo.content_service.dto.breathing.CustomBreathingRequest;
import com.mindigo.content_service.exceptions.breathing.ExerciseNotFound;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.services.BreathingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/content/breathing")
@RequiredArgsConstructor
public class BreathingController {
    private static final Logger logger = LoggerFactory.getLogger(BreathingController.class);

    private final BreathingService breathingService;

    private static final String USER_ROLE = "USER";
    private static final String UNAUTHORIZED_MESSAGE = "Access denied: USER role required";
    private static final String INVALID_USER_ID_MESSAGE = "Invalid user ID format";

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
        if (!USER_ROLE.equalsIgnoreCase(role)) {
            log.warn("Unauthorized access attempt with role: {}", role);
            throw new InvalidRequestException(UNAUTHORIZED_MESSAGE);
        }
    }

    private <T> ResponseEntity<ApiResponseClass<T>> executeWithErrorHandling(
            String userId, String role, ServiceOperation<T> operation, String successMessage) {

        validateUserRole(role);
        Long parsedUserId = parseUserId(userId);
        T result = operation.execute(parsedUserId);

        return ResponseEntity.ok(ApiResponseClass.success(result, successMessage));
    }

    @FunctionalInterface
    private interface ServiceOperation<T> {
        T execute(Long userId);
    }

    // ============ API Endpoints ============

    @GetMapping
    public ResponseEntity<ApiResponseClass<List<BreathingResponse>>> getBreathingExercises(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {

        return executeWithErrorHandling(
                userId,
                role,
                breathingService::getBreathingOptions,
                "Breathing exercises retrieved successfully"
        );
    }

    @PutMapping
    public ResponseEntity<ApiResponseClass<BreathingResponse>> customizeBreathingExercise(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody CustomBreathingRequest request) {

        return executeWithErrorHandling(
                userId,
                role,
                parsedUserId -> breathingService.customizeBreathingExercise(parsedUserId, request),
                "Breathing exercise customized successfully"
        );
    }

    @PostMapping("/session")
    public ResponseEntity<ApiResponseClass<BreathingSessionResponse>> storeBreathingSession(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody BreathingSessionRequest request) {

        return executeWithErrorHandling(
                userId,
                role,
                parsedUserId -> breathingService.saveBreathingSession(parsedUserId, request),
                "Breathing session stored successfully"
        );
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponseClass<BreathingSessionResponse>> getLatestSession(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam LocalDate date) {

        return executeWithErrorHandling(
                userId,
                role,
                parsedUserId -> breathingService.getLastSession(parsedUserId, date),
                "Latest session retrieved successfully"
        );
    }

    // ============ Exception Handlers ============

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidRequest(InvalidRequestException e) {
        log.error("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(e.getMessage(), "400"));
    }

    @ExceptionHandler(ExerciseNotFound.class)
    public ResponseEntity<ApiResponseClass<Void>> handleExerciseNotFound(ExerciseNotFound e) {
        log.error("Exercise not found: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseClass.error(e.getMessage(), "404"));
    }

    @ExceptionHandler(NumberFormatException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleNumberFormatException(NumberFormatException e) {
        log.error("Number format exception: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(INVALID_USER_ID_MESSAGE, "400"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseClass<Void>> handleGenericException(Exception e) {
        log.error("Unexpected error in breathing controller", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred", "500"));
    }
}