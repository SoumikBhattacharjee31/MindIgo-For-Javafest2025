package com.mindigo.content_service.dto;

import com.mindigo.content_service.models.DifficultyLevel;
import com.mindigo.content_service.models.TaskType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseTaskRequest extends TaskRequest {

    @NotBlank(message = "Exercise instructions are mandatory")
    @Size(max = 2000, message = "Instructions cannot exceed 2000 characters")
    private String instructions;

    @Min(value = 1, message = "Estimated minutes must be at least 1")
    private Integer estimatedMinutes;

    private DifficultyLevel difficultyLevel;

    @Size(max = 500, message = "Equipment needed cannot exceed 500 characters")
    private String equipmentNeeded;

    @Builder
    public ExerciseTaskRequest(TaskType type, String title, String description, Integer orderIndex,
                               String instructions, Integer estimatedMinutes, DifficultyLevel difficultyLevel, String equipmentNeeded) {
        super(TaskType.EXERCISE, title, description, orderIndex);
        this.instructions = instructions;
        this.estimatedMinutes = estimatedMinutes;
        this.difficultyLevel = difficultyLevel;
        this.equipmentNeeded = equipmentNeeded;
    }
}