package com.mindigo.content_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

// Meditation Task Entity
@Entity
@DiscriminatorValue("MEDITATION")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class MeditationTask extends Task {

    @Size(max = 500, message = "Audio URL cannot exceed 500 characters")
    @Column(name = "audio_url")
    private String audioUrl;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;

    @Enumerated(EnumType.STRING)
    @Column(name = "meditation_type")
    private MeditationType meditationType;

    @Builder
    public MeditationTask(CourseDay courseDay, String title, String description, Integer orderIndex,
                          String audioUrl, Integer durationMinutes, String instructions, MeditationType meditationType) {
        super(courseDay, title, description, orderIndex, TaskType.MEDITATION);
        this.audioUrl = audioUrl;
        this.durationMinutes = durationMinutes;
        this.instructions = instructions;
        this.meditationType = meditationType;
    }
}

