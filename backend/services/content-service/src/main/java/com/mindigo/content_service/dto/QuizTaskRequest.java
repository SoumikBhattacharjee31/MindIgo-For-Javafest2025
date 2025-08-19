package com.mindigo.content_service.dto;

import com.mindigo.content_service.models.TaskType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class QuizTaskRequest extends TaskRequest {

    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;

    @Min(value = 1, message = "Pass percentage must be at least 1")
    @Max(value = 100, message = "Pass percentage cannot exceed 100")
    private Integer passPercentage = 70;

    @Min(value = 1, message = "Time limit must be at least 1 minute")
    private Integer timeLimitMinutes;

    private Boolean allowRetake = true;

    @Builder
    public QuizTaskRequest(TaskType type, String title, String description, Integer orderIndex,
                           String instructions, Integer passPercentage, Integer timeLimitMinutes, Boolean allowRetake) {
        super(TaskType.QUIZ, title, description, orderIndex);
        this.instructions = instructions;
        this.passPercentage = passPercentage;
        this.timeLimitMinutes = timeLimitMinutes;
        this.allowRetake = allowRetake;
    }
}