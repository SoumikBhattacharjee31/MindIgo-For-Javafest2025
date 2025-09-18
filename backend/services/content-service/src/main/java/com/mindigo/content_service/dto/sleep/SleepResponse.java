package com.mindigo.content_service.dto.sleep;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SleepResponse {
    private LocalDate date;
    private LocalTime sleepTime;
    private LocalTime wakeTime;
}
