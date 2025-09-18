package com.mindigo.content_service.repositories.breathing;

import com.mindigo.content_service.models.breathing.BreathingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface BreathingSessionRepository extends JpaRepository<BreathingSession,Long> {
    Optional<BreathingSession> findTopByUserIdAndDateOrderByCreatedAtDesc(Long userId, LocalDate date);
}
