package com.mindigo.routine_service.dto.request;

import com.mindigo.routine_service.enums.RoutineType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class CreateRoutineRequest {
    // Getters and Setters
    @NotBlank(message = "Routine name is required")
    private String name;

    private String description;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Routine type is required")
    private RoutineType routineType;

    @NotEmpty(message = "At least one activity is required")
    @Valid
    private List<CreateActivityRequest> activities;

}
