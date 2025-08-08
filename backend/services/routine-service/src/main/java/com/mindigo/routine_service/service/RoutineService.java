package com.mindigo.routine_service.service;


import com.mindigo.routine_service.dto.request.AssignRoutineRequest;
import com.mindigo.routine_service.dto.request.CreateRoutineRequest;
import com.mindigo.routine_service.dto.response.RoutineResponse;

import java.util.List;

public interface RoutineService {
    RoutineResponse createRoutine(CreateRoutineRequest request);
    RoutineResponse updateRoutine(Long routineId, CreateRoutineRequest request, Long doctorId);
    RoutineResponse getRoutineById(Long routineId);
    List<RoutineResponse> getRoutinesByDoctor(Long doctorId);
    void deleteRoutine(Long routineId, Long doctorId);
    void assignRoutineToPatient(AssignRoutineRequest request);
    void unassignRoutineFromPatient(Long patientId, Long routineId);
    List<RoutineResponse> getPatientRoutines(Long patientId);
}
