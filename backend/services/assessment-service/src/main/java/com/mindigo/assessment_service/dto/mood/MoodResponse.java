package com.mindigo.assessment_service.dto.mood;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MoodResponse {
    private String mood;
    private LocalDate date;
    private String description;
    private String reason;
}
