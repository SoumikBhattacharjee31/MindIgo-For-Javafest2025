package com.mindigo.assessment_service.exceptions;

import com.mindigo.assessment_service.dto.ApiResponseClass;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.format.DateTimeParseException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponseClass<Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(
                ApiResponseClass.error(ex.getMessage(), "BAD_REQUEST")
        );
    }

    @ExceptionHandler(DateTimeParseException.class)
    public ResponseEntity<ApiResponseClass<Object>> handleDateParse(DateTimeParseException ex) {
        return ResponseEntity.badRequest().body(
                ApiResponseClass.error("Invalid date format", "INVALID_DATE")
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseClass<Object>> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponseClass.error("Something went wrong", "INTERNAL_ERROR")
        );
    }
}
