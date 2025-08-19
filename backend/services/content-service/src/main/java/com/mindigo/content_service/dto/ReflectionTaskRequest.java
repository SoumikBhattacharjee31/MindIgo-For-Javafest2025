package com.mindigo.content_service.dto;

import com.mindigo.content_service.models.TaskType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ReflectionTaskRequest extends TaskRequest {

    @NotBlank(message = "Prompt is mandatory")
    @Size(max = 2000, message = "Prompt cannot exceed 2000 characters")
    private String prompt;

    @Min(value = 1, message = "Estimated minutes must be at least 1")
    private Integer estimatedMinutes;

    private Boolean allowVoiceResponse = false;

    @Builder
    public ReflectionTaskRequest(TaskType type, String title, String description, Integer orderIndex,
                                 String prompt, Integer estimatedMinutes, Boolean allowVoiceResponse) {
        super(TaskType.REFLECTION, title, description, orderIndex);
        this.prompt = prompt;
        this.estimatedMinutes = estimatedMinutes;
        this.allowVoiceResponse = allowVoiceResponse;
    }
}