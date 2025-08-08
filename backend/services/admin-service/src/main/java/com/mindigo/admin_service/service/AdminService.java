package com.mindigo.admin_service.service;

import com.mindigo.admin_service.dto.request.ApplicationReviewRequest;
import com.mindigo.admin_service.dto.response.AdminDashboardResponse;
import com.mindigo.admin_service.dto.response.DoctorApplicationDto;
import com.mindigo.admin_service.entity.*;
import com.mindigo.admin_service.repository.AdminAuditLogRepository;
import com.mindigo.admin_service.repository.DoctorApplicationRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final DoctorApplicationRepository applicationRepository;
    private final AdminAuditLogRepository auditLogRepository;

    public AdminDashboardResponse getDashboardStats() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        return AdminDashboardResponse.builder()
                .totalApplications(applicationRepository.count())
                .pendingApplications(applicationRepository.countByStatus(DoctorApplicationStatus.PENDING))
                .approvedApplications(applicationRepository.countByStatus(DoctorApplicationStatus.APPROVED))
                .rejectedApplications(applicationRepository.countByStatus(DoctorApplicationStatus.REJECTED))
                .recentApplications(applicationRepository.countRecentApplications(sevenDaysAgo))
                // Note: totalUsers, totalDoctors, activeUsers would come from Auth Service
                .build();
    }

    public Page<DoctorApplicationDto> getAllApplications(Pageable pageable) {
        Page<DoctorApplication> applications = applicationRepository.findAll(pageable);
        List<DoctorApplicationDto> dtos = applications.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, applications.getTotalElements());
    }

    public Page<DoctorApplicationDto> getApplicationsByStatus(DoctorApplicationStatus status, Pageable pageable) {
        Page<DoctorApplication> applications = applicationRepository.findByStatus(status, pageable);
        List<DoctorApplicationDto> dtos = applications.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, applications.getTotalElements());
    }

    public DoctorApplicationDto getApplicationById(Long id) {
        DoctorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        return convertToDto(application);
    }

    @Transactional
    public String reviewApplication(ApplicationReviewRequest request, String adminEmail, HttpServletRequest httpRequest) {
        DoctorApplication application = applicationRepository.findById(request.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + request.getApplicationId()));

        String oldStatus = application.getStatus().toString();

        switch (request.getStatus()) {
            case APPROVED:
                application.approve(adminEmail, request.getComments());
                // TODO: Call Auth Service to create doctor account
                logAdminAction(AdminActionType.DOCTOR_APPLICATION_APPROVED, adminEmail,
                        application.getEmail(), application.getId(),
                        "Doctor application approved for: " + application.getFullName(), httpRequest);
                break;

            case REJECTED:
                application.reject(adminEmail, request.getComments());
                logAdminAction(AdminActionType.DOCTOR_APPLICATION_REJECTED, adminEmail,
                        application.getEmail(), application.getId(),
                        "Doctor application rejected for: " + application.getFullName(), httpRequest);
                break;

            case ADDITIONAL_INFO_REQUIRED:
                application.requestAdditionalInfo(adminEmail, request.getComments());
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

    private DoctorApplicationDto convertToDto(DoctorApplication application) {
        return DoctorApplicationDto.builder()
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
}
