package com.mindigo.discussion_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationRequest {

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}