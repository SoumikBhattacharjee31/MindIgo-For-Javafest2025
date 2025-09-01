package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.BreathingExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BreathingExerciseRepository extends JpaRepository<BreathingExercise,Long> {
    List<BreathingExercise> findAllByIsCustomFalse();
}
