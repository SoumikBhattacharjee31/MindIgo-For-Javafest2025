package com.mindigo.admin_service.repository;

import com.mindigo.admin_service.entity.DoctorApplication;
import com.mindigo.admin_service.entity.DoctorApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorApplicationRepository extends JpaRepository<DoctorApplication, Long> {

    Optional<DoctorApplication> findByEmail(String email);

    Page<DoctorApplication> findByStatus(DoctorApplicationStatus status, Pageable pageable);

    List<DoctorApplication> findByStatusOrderByCreatedAtDesc(DoctorApplicationStatus status);

    @Query("SELECT COUNT(da) FROM DoctorApplication da WHERE da.status = :status")
    long countByStatus(@Param("status") DoctorApplicationStatus status);

    @Query("SELECT COUNT(da) FROM DoctorApplication da WHERE da.createdAt >= :date")
    long countRecentApplications(@Param("date") LocalDateTime date);

    @Query("SELECT da FROM DoctorApplication da WHERE da.status IN :statuses ORDER BY da.createdAt DESC")
    Page<DoctorApplication> findByStatusIn(@Param("statuses") List<DoctorApplicationStatus> statuses, Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByMedicalLicenseNumber(String licenseNumber);
}
