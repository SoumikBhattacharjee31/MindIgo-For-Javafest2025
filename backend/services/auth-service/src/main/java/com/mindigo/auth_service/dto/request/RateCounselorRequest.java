package com.mindigo.auth_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RateCounselorRequest {

    @NotNull(message = "Counselor ID cannot be null")
    private Long counselorId;

    @NotNull(message = "Rating cannot be null")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @Size(max = 2000, message = "Review cannot be longer than 2000 characters")
    private String review;
}