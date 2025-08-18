package com.mindigo.content_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("EXERCISE")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ExerciseTask extends Task {

    @NotBlank(message = "Exercise instructions are mandatory")
    @Size(max = 2000, message = "Instructions cannot exceed 2000 characters")
    @Column(nullable = false)
    private String instructions;

    @Min(value = 1, message = "Estimated minutes must be at least 1")
    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    private DifficultyLevel difficultyLevel;

    @Size(max = 500, message = "Equipment needed cannot exceed 500 characters")
    @Column(name = "equipment_needed")
    private String equipmentNeeded;

    @Builder
    public ExerciseTask(CourseDay courseDay, String title, String description, Integer orderIndex,
                        String instructions, Integer estimatedMinutes, DifficultyLevel difficultyLevel, String equipmentNeeded) {
        super(courseDay, title, description, orderIndex, TaskType.EXERCISE);
        this.instructions = instructions;
        this.estimatedMinutes = estimatedMinutes;
        this.difficultyLevel = difficultyLevel;
        this.equipmentNeeded = equipmentNeeded;
    }
}
