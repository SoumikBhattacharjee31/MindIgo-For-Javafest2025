package com.mindigo.admin_service.entity;

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
@Table(name = "doctor_applications", indexes = {
        @Index(name = "idx_application_email", columnList = "email"),
        @Index(name = "idx_application_status", columnList = "status"),
        @Index(name = "idx_application_created", columnList = "created_at")
})
public class DoctorApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 100)
    private String medicalLicenseNumber;

    @Column(nullable = false, length = 100)
    private String specialty;

    @Column(nullable = false, length = 50)
    private String yearsOfExperience;

    @Column(nullable = false, length = 200)
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
    private DoctorApplicationStatus status = DoctorApplicationStatus.PENDING;

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
    private List<DoctorDocument> documents = new ArrayList<>();

    // Helper methods
    public void addDocument(DoctorDocument document) {
        if (documents == null) {
            documents = new ArrayList<>();
        }
        documents.add(document);
        document.setApplication(this);
    }

    public void approve(String adminEmail, String comments) {
        this.status = DoctorApplicationStatus.APPROVED;
        this.reviewedBy = adminEmail;
        this.reviewedAt = LocalDateTime.now();
        this.adminComments = comments;
    }

    public void reject(String adminEmail, String comments) {
        this.status = DoctorApplicationStatus.REJECTED;
        this.reviewedBy = adminEmail;
        this.reviewedAt = LocalDateTime.now();
        this.adminComments = comments;
    }

    public void requestAdditionalInfo(String adminEmail, String comments) {
        this.status = DoctorApplicationStatus.ADDITIONAL_INFO_REQUIRED;
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
        return status == DoctorApplicationStatus.PENDING || status == DoctorApplicationStatus.UNDER_REVIEW;
    }
}
