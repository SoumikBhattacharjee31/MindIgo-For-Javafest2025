// UserProfileResponse.java
package com.mindigo.auth_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mindigo.auth_service.entity.CounselorStatus;
import com.mindigo.auth_service.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CounselorProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private LocalDate dateOfBirth;
    private String gender;
    private boolean isEmailVerified;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private String licenseNumber;
    private String speciality;
    private String verificationDocumentUrl;
    private CounselorStatus counselorStatus = CounselorStatus.PENDING_VERIFICATION;
    private Long adminVerifiedBy;
    private LocalDateTime adminVerifiedAt;
    private String verificationNotes;
    private Double ratings;
    private Boolean accepts_insurance;

    public static CounselorProfileResponse fromUser(User user) {
        return CounselorProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .dateOfBirth(user.getDateOfBirth())
                .gender(String.valueOf(user.getGender()))
                .isEmailVerified(user.getIsEmailVerified())
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .licenseNumber(user.getLicenseNumber())
                .speciality(user.getSpecialization())
                .verificationDocumentUrl(user.getVerificationDocumentUrl())
                .counselorStatus(user.getCounselorStatus())
                .adminVerifiedBy(user.getAdminVerifiedBy())
                .adminVerifiedAt(user.getAdminVerifiedAt())
                .verificationNotes(user.getVerificationNotes())
                .ratings(5.0)
                .accepts_insurance(true)
                .build();
    }

    public static List<CounselorProfileResponse> fromUsers(List<User> users) {
        List<CounselorProfileResponse> counselors = new ArrayList<>();
        for(User user: users)
                counselors.add(fromUser(user));
        return counselors;
    }
}