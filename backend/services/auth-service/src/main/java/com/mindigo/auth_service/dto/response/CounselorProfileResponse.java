package com.mindigo.auth_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mindigo.auth_service.entity.Counselor;
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
import java.util.stream.Collectors;

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

    // Counselor-specific fields
    private String licenseNumber;
    private String specialization; // Renamed from speciality for consistency
    private String verificationDocumentUrl;
    private CounselorStatus counselorStatus;
    private Long adminVerifiedBy;
    private LocalDateTime adminVerifiedAt;
    private String verificationNotes;
    private Boolean acceptsInsurance; // Renamed for consistency
    private Double ratings; // This seems to be hardcoded, which is fine for now

    public static CounselorProfileResponse fromUser(User user) {
        if (user == null) {
            return null;
        }

        // ✅ Get the counselor details from the nested object
        Counselor counselorDetails = user.getCounselorDetails();

        CounselorProfileResponseBuilder builder = CounselorProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .isEmailVerified(user.getIsEmailVerified())
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .ratings(user.getCounselorDetails().getAverageRating()); // Example value

        // ✅ Populate counselor-specific fields ONLY if counselorDetails exists
        if (counselorDetails != null) {
            builder.licenseNumber(counselorDetails.getLicenseNumber())
                    .specialization(counselorDetails.getSpecialization())
                    .verificationDocumentUrl(counselorDetails.getVerificationDocumentUrl())
                    .counselorStatus(counselorDetails.getCounselorStatus())
                    .adminVerifiedBy(counselorDetails.getAdminVerifiedBy())
                    .adminVerifiedAt(counselorDetails.getAdminVerifiedAt())
                    .verificationNotes(counselorDetails.getVerificationNotes())
                    .acceptsInsurance(counselorDetails.getAcceptsInsurance());
        }

        return builder.build();
    }

    public static List<CounselorProfileResponse> fromUsers(List<User> users) {
        if (users == null) {
            return new ArrayList<>();
        }
        return users.stream()
                .map(CounselorProfileResponse::fromUser)
                .collect(Collectors.toList());
    }
}