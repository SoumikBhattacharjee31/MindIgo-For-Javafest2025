package com.mindigo.content_service.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//this will contain nothing if a user visits for the first time. After that it will contain the exercise
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table( name = "user_specific_exercise")
public class UserSpecificExercise {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", referencedColumnName = "id")
    private BreathingExercise exercise;
}
