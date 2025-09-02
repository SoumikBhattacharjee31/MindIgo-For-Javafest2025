package com.mindigo.appointment_service.repository;

import com.mindigo.appointment_service.entity.CounselorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CounselorAvailabilityRepository extends JpaRepository<CounselorAvailability, Long> {

    List<CounselorAvailability> findByCounselorIdAndIsActiveTrue(Long counselorId);

    List<CounselorAvailability> findByCounselorIdAndDayOfWeekAndIsActiveTrue(Long counselorId, DayOfWeek dayOfWeek);

    @Query("SELECT ca FROM CounselorAvailability ca WHERE ca.counselorId = :counselorId AND " +
            "ca.dayOfWeek = :dayOfWeek AND ca.isActive = true AND " +
            "((ca.startTime <= :endTime AND ca.endTime > :startTime))")
    List<CounselorAvailability> findOverlappingAvailability(
            @Param("counselorId") Long counselorId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    Optional<CounselorAvailability> findByIdAndCounselorId(Long id, Long counselorId);
}