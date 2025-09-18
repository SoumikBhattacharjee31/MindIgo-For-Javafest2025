package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.sleep.SleepRequest;
import com.mindigo.content_service.dto.sleep.SleepResponse;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.services.SleepService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/content/sleep")
@RequiredArgsConstructor
public class SleepController {
    private static final Logger logger = LoggerFactory.getLogger(SleepController.class);

    private final SleepService sleepService;

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

    @PostMapping
    public ResponseEntity<ApiResponseClass<SleepResponse>> saveOrUpdate(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody SleepRequest request
    ) {
        return executeWithErrorHandling(
                userId,
                role,
                parsedUserId ->
                    sleepService.saveOrUpdate(parsedUserId, request),
                "Sleep data saved/updated successfully"
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponseClass<List<SleepResponse>>> getAllByUser(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role
    ) {
        return executeWithErrorHandling(
                userId,
                role,
                sleepService::getAllByUserId,
                "Fetched all sleep records"
        );
    }

    @DeleteMapping
    public ResponseEntity<ApiResponseClass<Void>> deleteByDate(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return executeWithErrorHandling(
                userId,
                role,
                parsedUserId -> {
                    sleepService.deleteByUserIdAndDate(parsedUserId, date);
                    return null;
                },
                "Sleep data deleted successfully"
        );
    }

    @GetMapping("/last")
    public ResponseEntity<ApiResponseClass<List<SleepResponse>>> getLastNDays(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate today,
            @RequestParam int days
    ) {
        return executeWithErrorHandling(
                userId,
                role,
                uid -> sleepService.getLastNDays(uid, today, days),
                "Fetched last " + days + " days of data"
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
        log.error("Unexpected error in sleep controller", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred", "500"));
    }
}