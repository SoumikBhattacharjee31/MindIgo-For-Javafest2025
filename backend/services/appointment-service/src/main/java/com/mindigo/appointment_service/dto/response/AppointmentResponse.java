package com.mindigo.appointment_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppointmentResponse {
    private Long id;
    private Long clientId;
    private Long counselorId;
    private String clientEmail;
    private String counselorEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String clientNotes;
    private String counselorNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User details
    private String clientName;
    private String counselorName;
}