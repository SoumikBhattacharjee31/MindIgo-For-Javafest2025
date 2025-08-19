package com.mindigo.admin_service.repository;

import com.mindigo.admin_service.entity.CounselorApplication;
import com.mindigo.admin_service.entity.CounselorApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CounselorApplicationRepository extends JpaRepository<CounselorApplication, Long> {

    Page<CounselorApplication> findByStatus(CounselorApplicationStatus status, Pageable pageable);

    long countByStatus(CounselorApplicationStatus status);

    @Query("SELECT COUNT(c) FROM CounselorApplication c WHERE c.createdAt >= :since")
    long countRecentApplications(@Param("since") LocalDateTime since);

    // Add this method
    Optional<CounselorApplication> findByEmail(String email);

    // Add this method to check for existing license numbers
    boolean existsByMedicalLicenseNumber(String medicalLicenseNumber);
}