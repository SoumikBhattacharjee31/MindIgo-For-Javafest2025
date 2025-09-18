package com.mindigo.auth_service.entity;

import com.mindigo.auth_service.entity.CounselorApplicationStatus;
import com.mindigo.auth_service.entity.CounselorDocument;
import com.mindigo.auth_service.entity.DocumentType;
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
@Table(name = "counselor_applications", indexes = {
        @Index(name = "idx_application_email", columnList = "email"),
        @Index(name = "idx_application_status", columnList = "status"),
        @Index(name = "idx_application_created", columnList = "created_at")
})
public class CounselorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = true, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 100)
    private String medicalLicenseNumber;

    @Column(nullable = false, length = 100)
    private String specialty;

    @Column(nullable = true, length = 50)
    private String yearsOfExperience;

    @Column(nullable = true, length = 200)
    private String currentWorkplace;

    @Column(name = "medical_school", length = 200)
    private String medicalSchool;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CounselorApplicationStatus status = CounselorApplicationStatus.PENDING;

    @Column(name = "admin_comments", columnDefinition = "TEXT")
    private String adminComments;

    @Column(name = "reviewed_by")
    private String reviewedBy; // Admin email who reviewed

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "application", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CounselorDocument> documents = new ArrayList<>();

    // Helper methods
    public void addDocument(CounselorDocument document) {
        if (documents == null) {
            documents = new ArrayList<>();
        }
        documents.add(document);
        document.setApplication(this);
    }

    public void approve(String adminEmail, String comments) {
        this.status = CounselorApplicationStatus.APPROVED;
        this.reviewedBy = adminEmail;
        this.reviewedAt = LocalDateTime.now();
        this.adminComments = comments;
    }

    public void reject(String adminEmail, String comments) {
        this.status = CounselorApplicationStatus.REJECTED;
        this.reviewedBy = adminEmail;
        this.reviewedAt = LocalDateTime.now();
        this.adminComments = comments;
    }

    public void requestAdditionalInfo(String adminEmail, String comments) {
        this.status = CounselorApplicationStatus.ADDITIONAL_INFO_REQUIRED;
        this.reviewedBy = adminEmail;
        this.reviewedAt = LocalDateTime.now();
        this.adminComments = comments;
    }

    public boolean hasRequiredDocuments() {
        for (DocumentType docType : DocumentType.values()) {
            if (docType.isRequired()) {
                boolean hasDocument = documents.stream()
                        .anyMatch(doc -> doc.getDocumentType() == docType);
                if (!hasDocument) {
                    return false;
                }
            }
        }
        return true;
    }

    public boolean isPending() {
        return status == CounselorApplicationStatus.PENDING || status == CounselorApplicationStatus.UNDER_REVIEW;
    }
}
