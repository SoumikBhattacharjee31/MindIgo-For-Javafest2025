package com.mindigo.routine_service.repository;

import com.mindigo.routine_service.entity.Routine;
import com.mindigo.routine_service.enums.RoutineType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {

    List<Routine> findByDoctorIdAndIsActiveTrue(Long doctorId);

    List<Routine> findByDoctorIdAndRoutineTypeAndIsActiveTrue(Long doctorId, RoutineType routineType);

    Optional<Routine> findByIdAndIsActiveTrue(Long id);

    @Query("SELECT r FROM Routine r JOIN r.patientRoutines pr WHERE pr.patientId = :patientId AND pr.isActive = true AND r.isActive = true")
    List<Routine> findActiveRoutinesByPatientId(@Param("patientId") Long patientId);
}
