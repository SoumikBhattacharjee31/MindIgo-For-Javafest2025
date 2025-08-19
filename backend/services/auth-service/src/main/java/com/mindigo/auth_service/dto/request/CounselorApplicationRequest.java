package com.mindigo.auth_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorApplicationRequest {

    private String email;
    private String fullName;
    private String phoneNumber;
    private String medicalLicenseNumber;
    private String specialty;
    private String yearsOfExperience;
    private String currentWorkplace;
    private String medicalSchool;
    private Integer graduationYear;
    private String bio;
    private String verificationDocumentUrl;
    private String profileImageUrl;
    private LocalDate dateOfBirth;
    private String gender;

    // Convert from CounselorRegisterRequest
    public static CounselorApplicationRequest fromCounselorRegisterRequest(
            CounselorRegisterRequest request,
            String verificationDocumentUrl,
            String profileImageUrl) {

        return CounselorApplicationRequest.builder()
                .email(request.getEmail())
                .fullName(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .medicalLicenseNumber(request.getLicenseNumber())
                .specialty(request.getSpecialization())
                .yearsOfExperience(request.getYearsOfExperience())
                .currentWorkplace(request.getCurrentWorkplace())
                .medicalSchool(request.getMedicalSchool())
                .graduationYear(request.getGraduationYear())
                .bio(request.getBio())
                .verificationDocumentUrl(verificationDocumentUrl)
                .profileImageUrl(profileImageUrl)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .build();
    }
}