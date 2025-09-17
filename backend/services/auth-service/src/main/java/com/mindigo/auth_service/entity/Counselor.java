package com.mindigo.auth_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "counselors", indexes = {
        @Index(name = "idx_counselor_user_id", columnList = "user_id", unique = true),
        @Index(name = "idx_counselor_status", columnList = "counselor_status")
})
public class Counselor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This establishes the link back to the User entity
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "specialization", length = 200)
    private String specialization;

    @Column(name = "verification_document_url", length = 500)
    private String verificationDocumentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "counselor_status", length = 20, nullable = false)
    @Builder.Default
    private CounselorStatus counselorStatus = CounselorStatus.PENDING_VERIFICATION;

    // ✨ New field as requested
    @Column(name = "accepts_insurance", nullable = false)
    @Builder.Default
    private Boolean acceptsInsurance = false;

    @Column(name = "admin_verified_by")
    private Long adminVerifiedBy;

    @Column(name = "admin_verified_at")
    private LocalDateTime adminVerifiedAt;

    @Column(name = "verification_notes", length = 1000)
    private String verificationNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "average_rating")
    @Builder.Default
    private Double averageRating = 0.0;

    @Column(name = "total_ratings")
    @Builder.Default
    private Integer totalRatings = 0;

    @OneToMany(mappedBy = "counselor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CounselorRating> ratings = new ArrayList<>();

    // --- Helper methods moved from User entity ---

    public boolean isApproved() {
        return counselorStatus == CounselorStatus.APPROVED;
    }

    public boolean isPending() {
        return counselorStatus == CounselorStatus.PENDING_VERIFICATION;
    }

    public void approve(Long adminId, String notes) {
        this.counselorStatus = CounselorStatus.APPROVED;
        this.adminVerifiedBy = adminId;
        this.adminVerifiedAt = LocalDateTime.now();
        this.verificationNotes = notes;
    }

    public void reject(Long adminId, String notes) {
        this.counselorStatus = CounselorStatus.REJECTED;
        this.adminVerifiedBy = adminId;
        this.adminVerifiedAt = LocalDateTime.now();
        this.verificationNotes = notes;
    }
}