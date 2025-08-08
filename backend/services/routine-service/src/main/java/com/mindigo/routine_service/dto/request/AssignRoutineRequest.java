package com.mindigo.routine_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AssignRoutineRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Routine ID is required")
    private Long routineId;
}
