package com.mindigo.appointment_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentStatusRequest {
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Status is required")
    private String status; // CONFIRMED, REJECTED, CANCELLED

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    private String rejectionReason;
}