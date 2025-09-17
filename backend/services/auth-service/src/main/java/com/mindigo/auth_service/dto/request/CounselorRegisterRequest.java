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
@NoArgsConstructor
@AllArgsConstructor
public class CounselorRegisterRequest {

    @NotBlank(message = "Name is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 100, message = "Name must not exceed 100 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String name;

    @NotBlank(message = "Email is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Email(message = "Please provide a valid email address", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 100, message = "Email must not exceed 100 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String email;

    @NotBlank(message = "Password is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(min = 8, max = 255, message = "Password must be between 8 and 255 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String password;

    @NotBlank(message = "Phone number is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 20, message = "Phone number must not exceed 20 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String phoneNumber;

    @NotBlank(message = "Medical license number is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 100, message = "License number must not exceed 100 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String licenseNumber;

    @NotBlank(message = "Specialization is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 200, message = "Specialization must not exceed 200 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String specialization;

    @NotNull(message = "Date of birth is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Past(message = "Date of birth must be in the past", groups = AuthValidationGroups.CounselorRegistration.class)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Gender must be MALE, FEMALE, or OTHER", groups = AuthValidationGroups.CounselorRegistration.class)
    private String gender;

    // Additional fields for counselor application
    @NotBlank(message = "Years of experience is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 50, message = "Years of experience must not exceed 50 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String yearsOfExperience;

    @NotBlank(message = "Current workplace is required", groups = AuthValidationGroups.CounselorRegistration.class)
    @Size(max = 200, message = "Current workplace must not exceed 200 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String currentWorkplace;

    @Size(max = 200, message = "Medical school must not exceed 200 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String medicalSchool;

    @Min(value = 1950, message = "Graduation year must be after 1950", groups = AuthValidationGroups.CounselorRegistration.class)
    @Max(value = 2024, message = "Graduation year cannot be in the future", groups = AuthValidationGroups.CounselorRegistration.class)
    private Integer graduationYear;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters", groups = AuthValidationGroups.CounselorRegistration.class)
    private String bio;

    private Boolean acceptsInsurance = false;
}