package com.mindigo.admin_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindigo.admin_service.dto.request.ApplicationReviewRequest;
import com.mindigo.admin_service.dto.request.CounselorApplicationCreateRequest;
import com.mindigo.admin_service.dto.request.CounselorApplicationStatusUpdateRequest;
import com.mindigo.admin_service.dto.response.AdminDashboardResponse;
import com.mindigo.admin_service.dto.response.CounselorApplicationDto;
import com.mindigo.admin_service.entity.*;
import com.mindigo.admin_service.repository.AdminAuditLogRepository;
import com.mindigo.admin_service.repository.CounselorApplicationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final CounselorApplicationRepository applicationRepository;
    private final AdminAuditLogRepository auditLogRepository;
    private final AuthServiceClient authServiceClient; // Add this injection
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminDashboardResponse getDashboardStats() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        return AdminDashboardResponse.builder()
                .totalApplications(applicationRepository.count())
                .pendingApplications(applicationRepository.countByStatus(CounselorApplicationStatus.PENDING))
                .approvedApplications(applicationRepository.countByStatus(CounselorApplicationStatus.APPROVED))
                .rejectedApplications(applicationRepository.countByStatus(CounselorApplicationStatus.REJECTED))
                .recentApplications(applicationRepository.countRecentApplications(sevenDaysAgo))
                // Note: totalUsers, totalCounselors, activeUsers would come from Auth Service
                .build();
    }

    public Page<CounselorApplicationDto> getAllApplications(Pageable pageable) {
        Page<CounselorApplication> applications = applicationRepository.findAll(pageable);
        List<CounselorApplicationDto> dtos = applications.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, applications.getTotalElements());
    }

    public Page<CounselorApplicationDto> getApplicationsByStatus(CounselorApplicationStatus status, Pageable pageable) {
        Page<CounselorApplication> applications = applicationRepository.findByStatus(status, pageable);
        List<CounselorApplicationDto> dtos = applications.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, applications.getTotalElements());
    }

    public CounselorApplicationDto getApplicationById(Long id) {
        CounselorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        return convertToDto(application);
    }

    @Transactional
    public String reviewApplication(ApplicationReviewRequest request, String adminEmail, HttpServletRequest httpRequest) {
        CounselorApplication application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + request.getApplicationId()));

        String oldStatus = application.getStatus().toString();

        switch (request.getStatus()) {
            case APPROVED:
                application.approve(adminEmail, request.getComments());

                // Notify auth service about approval asynchronously
                CompletableFuture.runAsync(() -> {
                    try {
                        authServiceClient.updateCounselorStatus(
                                application.getEmail(),
                                "APPROVED",
                                request.getComments()
                        );
                    } catch (Exception e) {
                        log.error("Failed to notify auth service about counselor approval for: {}",
                                application.getEmail(), e);
                    }
                });

                logAdminAction(AdminActionType.Counselor_APPLICATION_APPROVED, adminEmail,
                        application.getEmail(), application.getId(),
                        "Counselor application approved for: " + application.getFullName(), httpRequest);
                break;

            case REJECTED:
                application.reject(adminEmail, request.getComments());

                // Notify auth service about rejection asynchronously
                CompletableFuture.runAsync(() -> {
                    try {
                        authServiceClient.updateCounselorStatus(
                                application.getEmail(),
                                "REJECTED",
                                request.getComments()
                        );
                    } catch (Exception e) {
                        log.error("Failed to notify auth service about counselor rejection for: {}",
                                application.getEmail(), e);
                    }
                });

                logAdminAction(AdminActionType.Counselor_APPLICATION_REJECTED, adminEmail,
                        application.getEmail(), application.getId(),
                        "Counselor application rejected for: " + application.getFullName(), httpRequest);
                break;

            case ADDITIONAL_INFO_REQUIRED:
                application.requestAdditionalInfo(adminEmail, request.getComments());

                // Notify auth service about additional info request asynchronously
                CompletableFuture.runAsync(() -> {
                    try {
                        authServiceClient.updateCounselorStatus(
                                application.getEmail(),
                                "ADDITIONAL_INFO_REQUIRED",
                                request.getComments()
                        );
                    } catch (Exception e) {
                        log.error("Failed to notify auth service about additional info request for: {}",
                                application.getEmail(), e);
                    }
                });
                break;

            default:
                throw new RuntimeException("Invalid status for review: " + request.getStatus());
        }

        applicationRepository.save(application);

        log.info("Application {} status changed from {} to {} by admin: {}",
                application.getId(), oldStatus, request.getStatus(), adminEmail);

        return "Application reviewed successfully";
    }

    private void logAdminAction(AdminActionType actionType, String adminEmail, String targetEmail,
                                Long targetId, String description, HttpServletRequest request) {

        AdminAuditLog auditLog = AdminAuditLog.builder()
                .adminEmail(adminEmail)
                .actionType(actionType)
                .targetEmail(targetEmail)
                .targetId(targetId)
                .description(description)
                .ipAddress(getClientIpAddress(request))
                .userAgent(request.getHeader("User-Agent"))
                .additionalData("{}")
                .build();

        auditLogRepository.save(auditLog);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }

    private CounselorApplicationDto convertToDto(CounselorApplication application) {
        return CounselorApplicationDto.builder()
                .id(application.getId())
                .email(application.getEmail())
                .fullName(application.getFullName())
                .phoneNumber(application.getPhoneNumber())
                .medicalLicenseNumber(application.getMedicalLicenseNumber())
                .specialty(application.getSpecialty())
                .yearsOfExperience(application.getYearsOfExperience())
                .currentWorkplace(application.getCurrentWorkplace())
                .medicalSchool(application.getMedicalSchool())
                .graduationYear(application.getGraduationYear())
                .bio(application.getBio())
                .status(application.getStatus())
                .adminComments(application.getAdminComments())
                .reviewedBy(application.getReviewedBy())
                .reviewedAt(application.getReviewedAt())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .hasRequiredDocuments(application.hasRequiredDocuments())
                .build();
    }

    // Add these methods to your existing AdminService class

    @Transactional
    public Long createCounselorApplication(@Valid CounselorApplicationCreateRequest request) {
        log.info("Creating counselor application for email: {}", request.getEmail());

        // Check if application already exists
        Optional<CounselorApplication> existingApplication =
                applicationRepository.findByEmail(request.getEmail());

        if (existingApplication.isPresent()) {
            log.warn("Counselor application already exists for email: {}", request.getEmail());
            return existingApplication.get().getId();
        }

        try {
            // Create new counselor application
            CounselorApplication application = CounselorApplication.builder()
                    .email(request.getEmail())
                    .fullName(request.getFullName())
                    .phoneNumber(request.getPhoneNumber())
                    .medicalLicenseNumber(request.getMedicalLicenseNumber())
                    .specialty(request.getSpecialty())
                    .yearsOfExperience(request.getYearsOfExperience())
                    .currentWorkplace(request.getCurrentWorkplace())
                    .medicalSchool(request.getMedicalSchool())
                    .graduationYear(request.getGraduationYear())
                    .bio(request.getBio())
                    .status(CounselorApplicationStatus.PENDING)
                    .build();

            // Create verification document entry if provided
            if (request.getVerificationDocumentUrl() != null && !request.getVerificationDocumentUrl().isEmpty()) {
                CounselorDocument document = CounselorDocument.builder()
                        .documentType(DocumentType.MEDICAL_LICENSE)
                        .fileName("verification_document")
                        .fileUrl(request.getVerificationDocumentUrl())
                        .mimeType("application/pdf") // You might want to determine this dynamically
                        .build();
                application.addDocument(document);
            }

            application = applicationRepository.save(application);

            log.info("Successfully created counselor application with ID: {} for email: {}",
                    application.getId(), request.getEmail());

            return application.getId();

        } catch (Exception e) {
            log.error("Failed to create counselor application for email: {}", request.getEmail(), e);
            throw new RuntimeException("Failed to create counselor application", e);
        }
    }

    @Transactional
    public void updateCounselorApplicationStatus(@Valid CounselorApplicationStatusUpdateRequest request) {
        log.info("Updating counselor application status for email: {} to status: {}",
                request.getEmail(), request.getStatus());

        try {
            CounselorApplication application = applicationRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Counselor application not found for email: " + request.getEmail()));

            // Update status based on request
            switch (request.getStatus()) {
                case APPROVED:
                    application.approve("SYSTEM", request.getComments());
                    break;
                case REJECTED:
                    application.reject("SYSTEM", request.getComments());
                    break;
                case ADDITIONAL_INFO_REQUIRED:
                    application.requestAdditionalInfo("SYSTEM", request.getComments());
                    break;
                default:
                    application.setStatus(request.getStatus());
                    application.setAdminComments(request.getComments());
                    application.setReviewedAt(LocalDateTime.now());
            }

            applicationRepository.save(application);

            log.info("Successfully updated counselor application status for email: {}", request.getEmail());

        } catch (Exception e) {
            log.error("Failed to update counselor application status for email: {}", request.getEmail(), e);
            throw new RuntimeException("Failed to update counselor application status", e);
        }
    }
}
