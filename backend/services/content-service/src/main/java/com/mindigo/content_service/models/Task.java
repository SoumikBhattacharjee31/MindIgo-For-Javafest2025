// Base Task Entity
package com.mindigo.content_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "task")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "task_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @NotNull(message = "CourseDay is mandatory")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private CourseDay courseDay;

    @NotNull(message = "Task type is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, insertable = false, updatable = false)
    private TaskType type;

    @NotBlank(message = "Title is mandatory")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Column(nullable = false)
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    private Boolean active = true;

    protected Task(CourseDay courseDay, String title, String description, Integer orderIndex, TaskType type) {
        this.courseDay = courseDay;
        this.title = title;
        this.description = description;
        this.orderIndex = orderIndex;
        this.type = type;
    }
}