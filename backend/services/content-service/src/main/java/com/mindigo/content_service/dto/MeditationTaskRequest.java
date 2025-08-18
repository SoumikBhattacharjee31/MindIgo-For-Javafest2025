package com.mindigo.content_service.dto;

import com.mindigo.content_service.models.MeditationType;
import com.mindigo.content_service.models.TaskType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class MeditationTaskRequest extends TaskRequest {

    @Size(max = 500, message = "Audio URL cannot exceed 500 characters")
    private String audioUrl;

    @NotNull(message = "Duration is mandatory")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;

    private MeditationType meditationType;

    @Builder
    public MeditationTaskRequest(TaskType type, String title, String description, Integer orderIndex,
                                 String audioUrl, Integer durationMinutes, String instructions, MeditationType meditationType) {
        super(TaskType.MEDITATION, title, description, orderIndex);
        this.audioUrl = audioUrl;
        this.durationMinutes = durationMinutes;
        this.instructions = instructions;
        this.meditationType = meditationType;
    }
}