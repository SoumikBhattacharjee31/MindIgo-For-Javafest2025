// RegisterRequest.java - Registration request
package com.mindigo.auth_service.dto;

import com.mindigo.auth_service.validators.AuthValidationGroups;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required", groups = AuthValidationGroups.Registration.class)
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters",
            groups = AuthValidationGroups.Registration.class)
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Name can only contain letters and spaces",
            groups = AuthValidationGroups.Registration.class)
    private String name;

    @NotBlank(message = "Email is required", groups = AuthValidationGroups.Registration.class)
    @Email(message = "Please provide a valid email address",
            groups = AuthValidationGroups.Registration.class)
    @Size(max = 100, message = "Email cannot exceed 100 characters",
            groups = AuthValidationGroups.Registration.class)
    private String email;

    @NotBlank(message = "Password is required", groups = AuthValidationGroups.Registration.class)
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters",
            groups = AuthValidationGroups.Registration.class)
    private String password;

    @NotBlank(message = "Role is required", groups = AuthValidationGroups.Registration.class)
    @Pattern(regexp = "^(USER|ADMIN|MODERATOR)$", message = "Invalid role",
            groups = AuthValidationGroups.Registration.class)
    private String role;

    @Past(message = "Date of birth must be in the past",
            groups = AuthValidationGroups.Registration.class)
    private LocalDate dateOfBirth;

    @Pattern(regexp = "^(MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY)$", message = "Invalid gender",
            groups = AuthValidationGroups.Registration.class)
    private String gender;
}