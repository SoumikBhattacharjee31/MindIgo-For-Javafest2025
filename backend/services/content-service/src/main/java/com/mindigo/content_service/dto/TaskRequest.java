package com.mindigo.content_service.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.mindigo.content_service.models.TaskType;
import com.mindigo.content_service.models.MeditationType;
import com.mindigo.content_service.models.DifficultyLevel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

// ================================
// BASE REQUEST DTO
// ================================
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = VideoTaskRequest.class, name = "VIDEO"),
        @JsonSubTypes.Type(value = MeditationTaskRequest.class, name = "MEDITATION"),
        @JsonSubTypes.Type(value = ReflectionTaskRequest.class, name = "REFLECTION"),
        @JsonSubTypes.Type(value = QuizTaskRequest.class, name = "QUIZ"),
        @JsonSubTypes.Type(value = ExerciseTaskRequest.class, name = "EXERCISE")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class TaskRequest {

    @NotNull(message = "Task type is mandatory")
    private TaskType type;

    @NotBlank(message = "Title is mandatory")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Min(value = 0, message = "Order index must be non-negative")
    private Integer orderIndex;
}