package com.mindigo.assessment_service.dto.sleep;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SleepRequest {
    private Long userId;
    private LocalDate date;
    private LocalTime sleepTime;
    private LocalTime wakeTime;
}
