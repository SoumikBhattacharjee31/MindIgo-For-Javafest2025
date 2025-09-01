package com.mindigo.content_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "breathing_task")
public class BreathingTask {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", referencedColumnName = "id")
    private Cycle cycle;

    @NotNull
    private Integer order;

    @NotNull
    @Enumerated(EnumType.STRING)
    private BreathingType type;

    @NotNull
    private Integer duration; // seconds
}
