package com.mindigo.assessment_service.repositories;

import com.mindigo.assessment_service.models.Mood;
import com.mindigo.assessment_service.models.MoodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MoodRepository extends JpaRepository<Mood, Long> {
    List<Mood> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<Mood> findByUserIdAndDate(Long userId, LocalDate date);

    Boolean existsByUserIdAndDate(Long userId, LocalDate date);
}
