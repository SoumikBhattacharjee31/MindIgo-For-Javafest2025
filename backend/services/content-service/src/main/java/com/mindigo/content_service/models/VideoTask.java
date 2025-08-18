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
@DiscriminatorValue("VIDEO")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class VideoTask extends Task {

    @NotBlank(message = "Video URL is mandatory")
    @Size(max = 500, message = "Video URL cannot exceed 500 characters")
    @Column(name = "video_url", nullable = false)
    private String videoUrl;

    @Min(value = 1, message = "Duration must be at least 1 second")
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Size(max = 255, message = "Thumbnail URL cannot exceed 255 characters")
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Builder
    public VideoTask(CourseDay courseDay, String title, String description, Integer orderIndex,
                     String videoUrl, Integer durationSeconds, String thumbnailUrl) {
        super(courseDay, title, description, orderIndex, TaskType.VIDEO);
        this.videoUrl = videoUrl;
        this.durationSeconds = durationSeconds;
        this.thumbnailUrl = thumbnailUrl;
    }
}