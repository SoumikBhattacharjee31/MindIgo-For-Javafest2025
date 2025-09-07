package com.mindigo.appointment_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorSettingsRequest {
    @Min(value = 1, message = "Max booking days must be at least 1")
    @Max(value = 30, message = "Max booking days cannot exceed 30")
    private Integer maxBookingDays = 10;

    @Min(value = 15, message = "Default slot duration must be at least 15 minutes")
    @Max(value = 240, message = "Default slot duration cannot exceed 240 minutes")
    private Integer defaultSlotDurationMinutes = 60;

    private Boolean autoAcceptAppointments = false;
}