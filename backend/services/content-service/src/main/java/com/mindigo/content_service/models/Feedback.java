package com.mindigo.content_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @NotNull(message = "User ID is mandatory")
    @Column(name = "user_id", nullable = false)
    private Long userId; // Reference to User from auth_service

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course; // Optional, for course-level feedback

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id")
    private CourseDay courseDay; // Optional, for daily feedback

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task; // Optional, for task-specific feedback

    @NotNull(message = "Question type is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @NotBlank(message = "Question is mandatory")
    @Size(max = 255, message = "Question cannot exceed 255 characters")
    @Column(nullable = false)
    private String question;

    @Size(max = 1000, message = "Answer cannot exceed 1000 characters")
    @Column(nullable = false)
    private String answer; // Stores selected option for MCQ/dropdown or text for open-ended

    @ElementCollection
    @CollectionTable(name = "feedback_options", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "option")
    private List<String> options; // For MCQ or dropdown questions

    @Column(name = "expert_designed", nullable = false)
    private boolean expertDesigned; // True if designed by expert, false if system-generated

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;
}