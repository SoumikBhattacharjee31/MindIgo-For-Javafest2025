package com.mindigo.admin_service.dto.request;

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
public class CounselorApplicationCreateRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

//    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "Medical license number is required")
    private String medicalLicenseNumber;

    @NotBlank(message = "Specialty is required")
    private String specialty;

//    @NotBlank(message = "Years of experience is required")
    private String yearsOfExperience;

//    @NotBlank(message = "Current workplace is required")
    private String currentWorkplace;

    private String medicalSchool;
    private Integer graduationYear;
    private String bio;
    private String verificationDocumentUrl;
    private String profileImageUrl;
    private LocalDate dateOfBirth;
    private String gender;
}