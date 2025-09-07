package com.mindigo.appointment_service.repository;

import com.mindigo.appointment_service.entity.DateSpecificAvailability;
import com.mindigo.appointment_service.entity.AvailabilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DateSpecificAvailabilityRepository extends JpaRepository<DateSpecificAvailability, Long> {

    List<DateSpecificAvailability> findByCounselorIdAndIsActiveTrue(Long counselorId);

    List<DateSpecificAvailability> findByCounselorIdAndSpecificDateAndIsActiveTrue(Long counselorId, LocalDate specificDate);

    @Query("SELECT dsa FROM DateSpecificAvailability dsa WHERE dsa.counselorId = :counselorId AND " +
            "dsa.specificDate = :specificDate AND dsa.isActive = true AND " +
            "((dsa.startTime < :endTime AND dsa.endTime > :startTime))")
    List<DateSpecificAvailability> findOverlappingDateSpecificAvailability(
            @Param("counselorId") Long counselorId,
            @Param("specificDate") LocalDate specificDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    Optional<DateSpecificAvailability> findByIdAndCounselorId(Long id, Long counselorId);

    @Query("SELECT dsa FROM DateSpecificAvailability dsa WHERE dsa.counselorId = :counselorId AND " +
            "dsa.specificDate BETWEEN :startDate AND :endDate AND dsa.isActive = true")
    List<DateSpecificAvailability> findByDateRange(
            @Param("counselorId") Long counselorId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}