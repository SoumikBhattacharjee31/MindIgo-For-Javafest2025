package com.mindigo.routine_service.repository;

import com.mindigo.routine_service.entity.PatientRoutine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRoutineRepository extends JpaRepository<PatientRoutine, Long> {

    List<PatientRoutine> findByPatientIdAndIsActiveTrue(Long patientId);

    Optional<PatientRoutine> findByPatientIdAndRoutineIdAndIsActiveTrue(Long patientId, Long routineId);

    List<PatientRoutine> findByRoutineIdAndIsActiveTrue(Long routineId);
}
