package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.sleep.SleepData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SleepDataRepository extends JpaRepository<SleepData, Long> {
    Optional<SleepData> findByUserIdAndDate(Long userId, LocalDate date);

    void deleteByUserIdAndDate(Long userId, LocalDate date);

    List<SleepData> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
