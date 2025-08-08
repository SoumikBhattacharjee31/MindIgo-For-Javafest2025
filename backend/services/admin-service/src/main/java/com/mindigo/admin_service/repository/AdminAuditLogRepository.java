package com.mindigo.admin_service.repository;

import com.mindigo.admin_service.entity.AdminAuditLog;
import com.mindigo.admin_service.entity.AdminActionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {

    Page<AdminAuditLog> findByAdminEmailOrderByTimestampDesc(String adminEmail, Pageable pageable);

    Page<AdminAuditLog> findByActionTypeOrderByTimestampDesc(AdminActionType actionType, Pageable pageable);

    @Query("SELECT aal FROM AdminAuditLog aal WHERE aal.timestamp >= :startDate AND aal.timestamp <= :endDate ORDER BY aal.timestamp DESC")
    List<AdminAuditLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT aal FROM AdminAuditLog aal WHERE aal.targetEmail = :email ORDER BY aal.timestamp DESC")
    List<AdminAuditLog> findByTargetEmail(@Param("email") String email);
}
