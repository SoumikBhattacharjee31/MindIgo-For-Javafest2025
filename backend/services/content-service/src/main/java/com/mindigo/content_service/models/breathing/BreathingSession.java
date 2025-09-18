package com.mindigo.content_service.models.breathing;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table( name = "breathing_session")
public class BreathingSession {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", referencedColumnName = "id")
    private BreathingExercise exercise;

    @Column(name = "completed_cycles", nullable = false)
    @Min(value = 1)
    private Integer completedCycles;

    @Column(name = "total_cycles", nullable = false)
    @Min(value = 1)
    private Integer totalCycles;

    @NotNull
    private LocalDate date;

    @NotNull
    private Integer duration;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
