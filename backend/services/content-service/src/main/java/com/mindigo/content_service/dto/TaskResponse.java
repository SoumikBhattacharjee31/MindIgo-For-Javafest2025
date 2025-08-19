package com.mindigo.content_service.dto;

import com.mindigo.content_service.models.DifficultyLevel;
import com.mindigo.content_service.models.MeditationType;
import com.mindigo.content_service.models.TaskType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private TaskType type;
    private String title;
    private String description;
    private Integer orderIndex;
    private Boolean active;
    private Boolean canEdit;

    // Video Task Fields
    private String videoUrl;
    private Integer durationSeconds;
    private String thumbnailUrl;

    // Meditation Task Fields
    private String audioUrl;
    private Integer durationMinutes;
    private String instructions;
    private MeditationType meditationType;

    // Reflection Task Fields
    private String prompt;
    private Integer estimatedMinutes;
    private Boolean allowVoiceResponse;

    // Quiz Task Fields
    private Integer passPercentage;
    private Integer timeLimitMinutes;
    private Boolean allowRetake;

    // Exercise Task Fields
    private DifficultyLevel difficultyLevel;
    private String equipmentNeeded;

    // Common fields that might be used by multiple types
    // Note: instructions is used by meditation, quiz, and exercise tasks
    // estimatedMinutes is used by reflection and exercise tasks
}