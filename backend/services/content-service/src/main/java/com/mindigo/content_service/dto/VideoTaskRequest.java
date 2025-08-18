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
public class VideoTaskRequest extends TaskRequest {

    @NotBlank(message = "Video URL is mandatory")
    @Size(max = 500, message = "Video URL cannot exceed 500 characters")
    private String videoUrl;

    @Min(value = 1, message = "Duration must be at least 1 second")
    private Integer durationSeconds;

    @Size(max = 255, message = "Thumbnail URL cannot exceed 255 characters")
    private String thumbnailUrl;

    @Builder
    public VideoTaskRequest(TaskType type, String title, String description, Integer orderIndex,
                            String videoUrl, Integer durationSeconds, String thumbnailUrl) {
        super(TaskType.VIDEO, title, description, orderIndex);
        this.videoUrl = videoUrl;
        this.durationSeconds = durationSeconds;
        this.thumbnailUrl = thumbnailUrl;
    }
}

