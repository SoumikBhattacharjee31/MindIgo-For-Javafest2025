package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.UserSpecificExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSpecificExerciseRepository extends JpaRepository<UserSpecificExercise,Long> {
    List<UserSpecificExercise> findAllByUserId(Long userId);
    boolean existsByUserIdAndExerciseId(Long userId, Long exerciseId);
    Optional<UserSpecificExercise> findByUserIdAndExerciseId(Long userId, Long exerciseId);
}
