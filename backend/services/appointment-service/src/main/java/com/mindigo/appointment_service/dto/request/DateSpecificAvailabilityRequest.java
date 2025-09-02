package com.mindigo.appointment_service.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DateSpecificAvailabilityRequest {
    @NotNull(message = "Specific date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate specificDate;

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    @NotNull(message = "Availability type is required")
    private String type; // AVAILABLE or UNAVAILABLE

    @Min(value = 15, message = "Slot duration must be at least 15 minutes")
    @Max(value = 240, message = "Slot duration cannot exceed 240 minutes")
    private Integer slotDurationMinutes = 60;

    @Size(max = 200, message = "Reason cannot exceed 200 characters")
    private String reason;
}