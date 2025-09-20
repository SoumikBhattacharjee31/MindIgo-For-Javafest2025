package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.game.GridResponse;
import com.mindigo.content_service.dto.TestResponse;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.exceptions.game.InvalidParameterException;
import com.mindigo.content_service.services.InfinityLoopService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/game/infinity-loop")
@RequiredArgsConstructor
public class GameController {
    private static final Logger logger = LoggerFactory.getLogger(GameController.class);

    private final InfinityLoopService infinityLoopService;

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
            // throw new InvalidRequestException(UNAUTHORIZED_MESSAGE);
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
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        return executeWithErrorHandling(
                null, null,
                () -> TestResponse.builder()
                        .api("/api/v1/game/test")
                        .status("UP")
                        .build(),
                "Game service is healthy"
        );
    }

    @GetMapping("/get-grid")
    public ResponseEntity<ApiResponseClass<GridResponse>> getInfinityLoopGrid(
            @RequestParam(defaultValue = "5") int size,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole
    ) {

        return executeWithErrorHandling(
                userId, userRole,
                () -> infinityLoopService.getGrid(size),
                "Grid generated successfully"
        );
    }

    // ============ Exception Handlers ============

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidRequest(InvalidRequestException e) {
        log.error("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(e.getMessage(), "400"));
    }

    @ExceptionHandler(InvalidParameterException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidParameter(InvalidParameterException e) {
        log.error("Invalid parameter: {}", e.getMessage());
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
        log.error("Unexpected error in game controller", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred", "500"));
    }
}