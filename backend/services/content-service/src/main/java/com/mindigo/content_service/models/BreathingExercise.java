package com.mindigo.content_service.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "breathing_exercise")
public class BreathingExercise {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String pattern;

    @NotNull
    @Min(value = 1)
    private Integer duration; // minutes

    @Builder.Default
    private Boolean isCustom = false; // this is false indicates that default exercises for all users

    private Boolean isCustomizable; // if true then the breathing tasks can be changed, otherwise only cycle duration changeable

    @OneToOne(cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.EAGER)
    @JoinColumn(name = "cycle_id", referencedColumnName = "id")
    private Cycle cycle;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.LAZY)
    private List<UserSpecificExercise> userSpecificExercise;

    @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<BreathingSession> breathingSession;
}
