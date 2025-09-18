package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.*;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/content")
@Tag(name = "Content Service", description = "Courses and Tasks")
@RequiredArgsConstructor
public class ContentController {
    private static final Logger logger = LoggerFactory.getLogger(ContentController.class);

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

        if (userId != null && role != null) {
            validateUserRole(role);
            Long parsedUserId = parseUserId(userId);
        }
        T result = operation.execute();

        return ResponseEntity.ok(ApiResponseClass.success(result, successMessage));
    }

    @FunctionalInterface
    private interface ServiceOperation<T> {
        T execute();
    }

    // ============ API Endpoints ============

    @GetMapping("/test")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        return executeWithErrorHandling(
                null, null,
                () -> TestResponse.builder()
                        .api("/api/v1/content/test")
                        .status("UP")
                        .build(),
                "Service is healthy"
        );
    }

    @GetMapping("/header-test")
    @Operation(summary = "Test JWT authentication headers")
    public ResponseEntity<ApiResponseClass<Map<String, String>>> testHeader(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-Authenticated", required = false) String authenticated
    ) {
        return executeWithErrorHandling(
                userId, userRole,
                () -> {
                    Map<String, String> response = new HashMap<>();
                    response.put("Id", userId != null ? userId : "Not available");
                    response.put("Email", userEmail != null ? userEmail : "Not available");
                    response.put("Role", userRole != null ? userRole : "Not available");
                    response.put("Authenticated", authenticated != null ? authenticated : "false");
                    return response;
                },
                "true".equals(authenticated) ? "Headers from JWT authentication" : "No authentication headers found"
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
        log.error("Unexpected error in content controller", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred", "500"));
    }
}