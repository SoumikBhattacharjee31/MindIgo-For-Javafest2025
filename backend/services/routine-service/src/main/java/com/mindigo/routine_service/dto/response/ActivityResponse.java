package com.mindigo.routine_service.dto.response;

import com.mindigo.routine_service.enums.ActivityType;
import com.mindigo.routine_service.enums.DayOfWeek;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
public class ActivityResponse {
    private Long id;
    private String activityName;
    private ActivityType activityType;
    private String description;
    private LocalTime startTime;
    private LocalTime endTime;
    private DayOfWeek dayOfWeek;
    private String instructions;
    private Boolean isActive;
}
