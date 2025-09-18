package com.mindigo.content_service.repositories.breathing;

import com.mindigo.content_service.models.breathing.BreathingExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BreathingExerciseRepository extends JpaRepository<BreathingExercise,Long> {
    List<BreathingExercise> findAllByIsCustomFalse();
}
