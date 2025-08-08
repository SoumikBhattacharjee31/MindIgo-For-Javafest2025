package com.mindigo.routine_service.dto.response;

import com.mindigo.routine_service.enums.RoutineType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class RoutineResponse {
    private Long id;
    private String name;
    private String description;
    private Long doctorId;
    private RoutineType routineType;
    private Boolean isActive;
    private List<ActivityResponse> activities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
