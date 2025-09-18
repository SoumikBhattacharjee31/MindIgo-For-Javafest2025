package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.mood.Mood;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MoodRepository extends JpaRepository<Mood, Long> {
    List<Mood> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    Optional<Mood> findByUserIdAndDate(Long userId, LocalDate date);

    Boolean existsByUserIdAndDate(Long userId, LocalDate date);
}
