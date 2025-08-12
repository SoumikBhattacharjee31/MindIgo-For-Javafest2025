package com.mindigo.auth_service.dto.request;

import com.mindigo.auth_service.validators.AuthValidationGroups;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CounselorRegisterRequest {

    @NotBlank(message = "Name is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters",
            groups = AuthValidationGroups.CounselorRegistration.class)
    private String name;

    @NotBlank(message = "Email is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Email(message = "Please provide a valid email address", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 100, message = "Email must not exceed 100 characters",
            groups = AuthValidationGroups.CounselorRegistration.class)
    private String email;

    @NotBlank(message = "Password is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters",
            groups = AuthValidationGroups.CounselorRegistration.class)
    private String password;

    @NotNull(message = "Date of birth is required", groups = AuthValidationGroups.CounselorRegistration.class)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required", groups = AuthValidationGroups.CounselorRegistration.class)
    private String gender;

    @NotBlank(message = "License number is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 100, message = "License number must not exceed 100 characters",
            groups = AuthValidationGroups.CounselorRegistration.class)
    private String licenseNumber;

    @NotBlank(message = "Specialization is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 200, message = "Specialization must not exceed 200 characters",
            groups = AuthValidationGroups.CounselorRegistration.class)
    private String specialization;
}