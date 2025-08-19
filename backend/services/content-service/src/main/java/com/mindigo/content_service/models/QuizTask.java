package com.mindigo.content_service.models;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("QUIZ")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class QuizTask extends Task {

    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;

    @Min(value = 1, message = "Pass percentage must be at least 1")
    @Max(value = 100, message = "Pass percentage cannot exceed 100")
    @Column(name = "pass_percentage")
    private Integer passPercentage = 70;

    @Min(value = 1, message = "Time limit must be at least 1 minute")
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "allow_retake")
    private Boolean allowRetake = true;

    @Builder
    public QuizTask(CourseDay courseDay, String title, String description, Integer orderIndex,
                    String instructions, Integer passPercentage, Integer timeLimitMinutes, Boolean allowRetake) {
        super(courseDay, title, description, orderIndex, TaskType.QUIZ);
        this.instructions = instructions;
        this.passPercentage = passPercentage != null ? passPercentage : 70;
        this.timeLimitMinutes = timeLimitMinutes;
        this.allowRetake = allowRetake != null ? allowRetake : true;
    }
}
