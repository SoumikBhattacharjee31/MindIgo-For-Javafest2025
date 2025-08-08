package com.mindigo.auth_service.services;

import com.mindigo.auth_service.entity.AuditLog;
import com.mindigo.auth_service.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log a security event
     *
     * @param eventType Type of event (e.g., "LOGIN_SUCCESS", "REGISTRATION_FAILED")
     * @param userEmail User email associated with the event
     * @param description Description of the event
     * @param ipAddress IP address of the client
     */
    public void logSecurityEvent(String eventType, String userEmail, String description, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .eventType(eventType)
                    .userEmail(userEmail != null ? userEmail : "ANONYMOUS")
                    .description(description)
                    .ipAddress(ipAddress)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit event logged - Type: {}, User: {}, IP: {}",
                    eventType, userEmail, ipAddress);
        } catch (Exception e) {
            log.error("Failed to log audit event: {}", e.getMessage(), e);
            // We don't want to fail the main operation if audit logging fails
        }
    }
}