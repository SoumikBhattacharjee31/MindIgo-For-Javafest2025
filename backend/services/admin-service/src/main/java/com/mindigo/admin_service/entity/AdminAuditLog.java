package com.mindigo.admin_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admin_audit_logs", indexes = {
        @Index(name = "idx_audit_admin_email", columnList = "admin_email"),
        @Index(name = "idx_audit_action_type", columnList = "action_type"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_email", nullable = false, length = 100)
    private String adminEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private AdminActionType actionType;

    @Column(name = "target_email", length = 100)
    private String targetEmail; // Email of affected user/counselor

    @Column(name = "target_id")
    private Long targetId; // ID of affected resource

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "additional_data", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private String additionalData; // Store additional context as JSON
}
