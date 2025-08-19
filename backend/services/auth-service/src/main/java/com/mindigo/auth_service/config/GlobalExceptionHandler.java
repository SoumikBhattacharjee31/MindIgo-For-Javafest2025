package com.mindigo.auth_service.config;

import com.mindigo.auth_service.dto.response.ApiResponseClass;
import com.mindigo.auth_service.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleUserAlreadyExists(
            UserAlreadyExistsException ex, HttpServletRequest request) {
        log.warn("User already exists: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("USER_ALREADY_EXISTS")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleUserNotFound(
            UserNotFoundException ex, HttpServletRequest request) {
        log.warn("User not found: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("USER_NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidCredentials(
            InvalidCredentialsException ex, HttpServletRequest request) {
        log.warn("Invalid credentials: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("INVALID_CREDENTIALS")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleEmailNotVerified(
            EmailNotVerifiedException ex, HttpServletRequest request) {
        log.warn("Email not verified: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("EMAIL_NOT_VERIFIED")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AccountDeactivatedException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleAccountDeactivated(
            AccountDeactivatedException ex, HttpServletRequest request) {
        log.warn("Account deactivated: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("ACCOUNT_DEACTIVATED")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidToken(
            InvalidTokenException ex, HttpServletRequest request) {
        log.warn("Invalid token: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("INVALID_TOKEN")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidOtp(
            InvalidOtpException ex, HttpServletRequest request) {
        log.warn("Invalid OTP: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("INVALID_OTP")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(TooManyAttemptsException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleTooManyAttempts(
            TooManyAttemptsException ex, HttpServletRequest request) {
        log.warn("Too many attempts: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("TOO_MANY_ATTEMPTS")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleRateLimitExceeded(
            RateLimitExceededException ex, HttpServletRequest request) {
        log.warn("Rate limit exceeded: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("RATE_LIMIT_EXCEEDED")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        log.warn("Bad request: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode("BAD_REQUEST")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseClass<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation failed - IP: {}", getClientIp(request));

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponseClass<Map<String, String>> response = ApiResponseClass.<Map<String, String>>builder()
                .success(false)
                .message("Validation failed")
                .data(errors)
                .errorCode("VALIDATION_FAILED")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleMaxSizeException(
            MaxUploadSizeExceededException ex, HttpServletRequest request) {
        log.warn("File size exceeded - IP: {}", getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message("File size exceeds maximum allowed limit")
                .errorCode("FILE_SIZE_EXCEEDED")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseClass<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error - IP: {} - Error: {}", getClientIp(request), ex.getMessage(), ex);

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message("An unexpected error occurred. Please try again later.")
                .errorCode("INTERNAL_SERVER_ERROR")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    @ExceptionHandler(AccountNotApprovedException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleAccountNotApproved(
            AccountNotApprovedException ex, HttpServletRequest request) {
        log.warn("Account not approved: {} - IP: {}", ex.getMessage(), getClientIp(request));

        ApiResponseClass<Void> response = ApiResponseClass.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .errorCode(ex.getErrorCode() != null ? ex.getErrorCode() : "ACCOUNT_NOT_APPROVED")
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
}