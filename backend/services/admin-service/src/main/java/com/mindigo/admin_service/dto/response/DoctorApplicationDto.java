package com.mindigo.admin_service.dto.response;

import com.mindigo.admin_service.entity.DoctorApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorApplicationDto {
    private Long id;
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
    private DoctorApplicationStatus status;
    private String adminComments;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<DoctorDocumentDto> documents;
    private boolean hasRequiredDocuments;
}
