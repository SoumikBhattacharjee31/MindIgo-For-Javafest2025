package com.mindigo.appointment_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponseClass<T> {
    private boolean success;
    private String message;
    private T data;
    private String errorCode;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponseClass<T> success(T data, String message) {
        return ApiResponseClass.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ApiResponseClass<T> error(String message, String errorCode) {
        return ApiResponseClass.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .build();
    }
}