package com.mindigo.discussion_service.dto.request;

import com.mindigo.discussion_service.entity.RestrictionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestrictUserRequest {

    @NotNull(message = "Restriction type is required")
    private RestrictionType restrictionType;

    @NotNull(message = "Duration in hours is required")
    @Positive(message = "Duration must be positive")
    private Integer durationInHours;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}