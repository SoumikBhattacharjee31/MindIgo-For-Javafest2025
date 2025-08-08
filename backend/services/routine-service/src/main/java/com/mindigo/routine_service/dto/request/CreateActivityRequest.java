package com.mindigo.routine_service.dto.request;

import com.mindigo.routine_service.enums.ActivityType;
import com.mindigo.routine_service.enums.DayOfWeek;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
public class CreateActivityRequest {
    // Getters and Setters
    @NotBlank(message = "Activity name is required")
    private String activityName;

    @NotNull(message = "Activity type is required")
    private ActivityType activityType;

    private String description;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private DayOfWeek dayOfWeek;

    private String instructions;

}
