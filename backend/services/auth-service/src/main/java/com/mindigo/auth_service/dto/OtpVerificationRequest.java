// OtpVerificationRequest.java
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
public class OtpVerificationRequest {

    @NotBlank(message = "OTP is required", groups = AuthValidationGroups.OtpVerification.class)
    @Size(min = 6, max = 6, message = "OTP must be 6 digits",
            groups = AuthValidationGroups.OtpVerification.class)
    @Pattern(regexp = "^[0-9]+$", message = "OTP must contain only numbers",
            groups = AuthValidationGroups.OtpVerification.class)
    private String otp;
}