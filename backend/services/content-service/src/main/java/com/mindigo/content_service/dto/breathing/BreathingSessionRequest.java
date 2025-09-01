package com.mindigo.content_service.dto.breathing;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BreathingSessionRequest {
    private Long exerciseId;
    private Integer completedCycles;
    private Integer totalCycles;
    private LocalDate date;
    private Integer duration;
}
