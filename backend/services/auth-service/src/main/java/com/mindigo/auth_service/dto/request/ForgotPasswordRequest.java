// ForgotPasswordRequest.java
package com.mindigo.auth_service.dto.request;

import com.mindigo.auth_service.validators.AuthValidationGroups;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required", groups = AuthValidationGroups.ForgotPassword.class)
    @Email(message = "Please provide a valid email address",
            groups = AuthValidationGroups.ForgotPassword.class)
    private String email;
}