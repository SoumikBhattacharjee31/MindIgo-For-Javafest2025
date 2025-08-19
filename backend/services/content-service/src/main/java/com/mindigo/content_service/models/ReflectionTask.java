package com.mindigo.content_service.models;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("REFLECTION")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ReflectionTask extends Task {

    @NotBlank(message = "Prompt is mandatory")
    @Size(max = 2000, message = "Prompt cannot exceed 2000 characters")
    @Column(nullable = false)
    private String prompt;

    @Min(value = 1, message = "Estimated minutes must be at least 1")
    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @Column(name = "allow_voice_response")
    private Boolean allowVoiceResponse = false;

    @Builder
    public ReflectionTask(CourseDay courseDay, String title, String description, Integer orderIndex,
                          String prompt, Integer estimatedMinutes, Boolean allowVoiceResponse) {
        super(courseDay, title, description, orderIndex, TaskType.REFLECTION);
        this.prompt = prompt;
        this.estimatedMinutes = estimatedMinutes;
        this.allowVoiceResponse = allowVoiceResponse != null ? allowVoiceResponse : false;
    }
}