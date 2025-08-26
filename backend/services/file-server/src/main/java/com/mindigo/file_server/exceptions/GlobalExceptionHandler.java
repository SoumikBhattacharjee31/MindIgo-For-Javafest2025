package com.mindigo.file_server.exceptions;

import com.mindigo.file_server.dto.ApiResponseClass;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FileOperationException.class)
    public ResponseEntity<ApiResponseClass<?>> handleFileOperationException(FileOperationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseClass.error(ex.getMessage(), HttpStatus.BAD_REQUEST.toString()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseClass<?>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.toString()));
    }
}