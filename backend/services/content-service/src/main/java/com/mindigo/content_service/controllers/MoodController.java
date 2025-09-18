package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.mood.MoodRequest;
import com.mindigo.content_service.dto.mood.MoodResponse;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.services.MoodService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/v1/content/mood")
@RequiredArgsConstructor
public class MoodController {
    private static final Logger logger = LoggerFactory.getLogger(MoodController.class);

    private final MoodService moodService;

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

    @GetMapping("/get-mood")
    @Operation(summary = "Get moods of an user of last 7 days")
    public ResponseEntity<ApiResponseClass<List<MoodResponse>>> getAllMoods(
            @RequestParam(name = "days", defaultValue = "7") @Min(0) int days,
            @RequestParam(name = "today") LocalDate today,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole
    ) {
        return executeWithErrorHandling(
                userId,
                userRole,
                parsedUserId -> moodService.getMoods(parsedUserId, days, today),
                "Moods retrieved successfully"
        );
    }

    @PostMapping("/set-mood")
    @Operation(summary = "Set mood of a date")
    public ResponseEntity<ApiResponseClass<MoodResponse>> setMood(
            @Valid @RequestBody MoodRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole
    ) {
        return executeWithErrorHandling(
                userId,
                userRole,
                parsedUserId -> moodService.setMoods(parsedUserId, request),
                "Mood successfully set"
        );
    }

    // ============ Exception Handlers ============

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidRequest(InvalidRequestException e) {
        log.error("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(e.getMessage(), "400"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Illegal argument: {}", e.getMessage());
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
        log.error("Unexpected error in mood controller", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred", "500"));
    }
}
