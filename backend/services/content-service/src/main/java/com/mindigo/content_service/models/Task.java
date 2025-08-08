package com.mindigo.content_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "task")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @NotNull(message = "CourseDay is mandatory")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private CourseDay courseDay;

    @NotNull(message = "Task type is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType type;

    @NotBlank(message = "Title is mandatory")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Column(nullable = false)
    private String title;

//    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
//    private String instructions;
//
//    @Size(max = 255, message = "Content URL cannot exceed 255 characters")
//    @Column(name = "content_url")
//    private String contentUrl;
}