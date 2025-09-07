// DateSpecificAvailabilityResponse.java
package com.mindigo.appointment_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DateSpecificAvailabilityResponse {
    private Long id;
    private LocalDate specificDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String type; // AVAILABLE or UNAVAILABLE
    private Integer slotDurationMinutes;
    private String reason;
    private Boolean isActive;
    private LocalDateTime createdAt;
}