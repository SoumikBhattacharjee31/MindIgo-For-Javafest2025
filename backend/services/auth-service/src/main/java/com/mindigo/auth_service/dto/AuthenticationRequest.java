// AuthenticationRequest.java - Login request
package com.mindigo.auth_service.dto;

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
public class AuthenticationRequest {

    @NotBlank(message = "Email is required", groups = {
            AuthValidationGroups.Login.class,
            AuthValidationGroups.ForgotPassword.class
    })
    @Email(message = "Please provide a valid email address", groups = {
            AuthValidationGroups.Login.class,
            AuthValidationGroups.ForgotPassword.class
    })
    private String email;

    @NotBlank(message = "Password is required", groups = AuthValidationGroups.Login.class)
    private String password;

    @Size(min = 6, max = 6, message = "OTP must be 6 digits",
            groups = AuthValidationGroups.OtpVerification.class)
    @Pattern(regexp = "^[0-9]+$", message = "OTP must contain only numbers",
            groups = AuthValidationGroups.OtpVerification.class)
    private String otp;
}