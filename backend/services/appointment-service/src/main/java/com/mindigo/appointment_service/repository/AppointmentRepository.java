package com.mindigo.appointment_service.repository;

import com.mindigo.appointment_service.entity.Appointment;
import com.mindigo.appointment_service.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByClientIdOrderByStartTimeDesc(Long clientId);

    List<Appointment> findByCounselorIdOrderByStartTimeDesc(Long counselorId);

    @Query("SELECT a FROM Appointment a WHERE a.counselorId = :counselorId AND " +
            "a.startTime BETWEEN :startDate AND :endDate AND a.status IN :statuses")
    List<Appointment> findByCounselorIdAndDateRangeAndStatus(
            @Param("counselorId") Long counselorId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("statuses") List<AppointmentStatus> statuses);

    @Query("SELECT a FROM Appointment a WHERE a.counselorId = :counselorId AND " +
            "((a.startTime <= :endTime AND a.endTime > :startTime)) AND " +
            "a.status IN ('PENDING', 'CONFIRMED')")
    List<Appointment> findConflictingAppointments(
            @Param("counselorId") Long counselorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    Optional<Appointment> findByIdAndCounselorId(Long id, Long counselorId);

    Optional<Appointment> findByIdAndClientId(Long id, Long clientId);
}