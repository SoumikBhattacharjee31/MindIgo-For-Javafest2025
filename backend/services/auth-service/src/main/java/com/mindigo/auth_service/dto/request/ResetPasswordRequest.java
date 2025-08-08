// ResetPasswordRequest.java
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
public class ResetPasswordRequest {

    @NotBlank(message = "Token is required", groups = AuthValidationGroups.PasswordReset.class)
    private String token;

    @NotBlank(message = "Password is required", groups = AuthValidationGroups.PasswordReset.class)
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters",
            groups = AuthValidationGroups.PasswordReset.class)
    private String newPassword;
}