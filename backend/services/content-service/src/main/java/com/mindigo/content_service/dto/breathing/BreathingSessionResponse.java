package com.mindigo.content_service.dto.breathing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BreathingSessionResponse {
    private Long exerciseId;
    private String exerciseTitle;
    private Integer completedCycles;
    private Integer totalCycles;
    private LocalDate date;
    private Integer duration;
}
