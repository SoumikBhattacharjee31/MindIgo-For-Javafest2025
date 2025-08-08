package com.mindigo.routine_service.service.impl;

import com.mindigo.routine_service.dto.request.AssignRoutineRequest;
import com.mindigo.routine_service.dto.request.CreateRoutineRequest;
import com.mindigo.routine_service.dto.response.ActivityResponse;
import com.mindigo.routine_service.dto.response.RoutineResponse;
import com.mindigo.routine_service.entity.PatientRoutine;
import com.mindigo.routine_service.entity.Routine;
import com.mindigo.routine_service.entity.RoutineActivity;
import com.mindigo.routine_service.exception.RoutineAlreadyAssignedException;
import com.mindigo.routine_service.exception.RoutineNotFoundException;
import com.mindigo.routine_service.exception.TimeOverlapException;
import com.mindigo.routine_service.exception.UnauthorizedAccessException;
import com.mindigo.routine_service.repository.PatientRoutineRepository;
import com.mindigo.routine_service.repository.RoutineRepository;
import com.mindigo.routine_service.service.RoutineService;
import com.mindigo.routine_service.service.TimeOverlapValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoutineServiceImpl implements RoutineService {

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private PatientRoutineRepository patientRoutineRepository;

    @Autowired
    private TimeOverlapValidationService timeOverlapValidationService;

    @Override
    public RoutineResponse createRoutine(CreateRoutineRequest request) {
        // Validate time overlaps
        timeOverlapValidationService.validateTimeOverlaps(request.getActivities(), request.getRoutineType());

        // Create routine entity
        Routine routine = new Routine(
                request.getName(),
                request.getDescription(),
                request.getDoctorId(),
                request.getRoutineType()
        );

        // Create activity entities
        List<RoutineActivity> activities = request.getActivities().stream()
                .map(activityRequest -> {
                    RoutineActivity activity = new RoutineActivity(
                            routine,
                            activityRequest.getActivityName(),
                            activityRequest.getActivityType(),
                            activityRequest.getStartTime(),
                            activityRequest.getEndTime()
                    );
                    activity.setDescription(activityRequest.getDescription());
                    activity.setDayOfWeek(activityRequest.getDayOfWeek());
                    activity.setInstructions(activityRequest.getInstructions());
                    return activity;
                })
                .collect(Collectors.toList());

        routine.setActivities(activities);

        // Save routine
        Routine savedRoutine = routineRepository.save(routine);

        return mapToRoutineResponse(savedRoutine);
    }

    @Override
    public RoutineResponse updateRoutine(Long routineId, CreateRoutineRequest request, Long doctorId) {
        Routine routine = routineRepository.findByIdAndIsActiveTrue(routineId)
                .orElseThrow(() -> new RoutineNotFoundException("Routine not found with ID: " + routineId));

        // Check if doctor owns this routine
        if (!routine.getDoctorId().equals(doctorId)) {
            throw new UnauthorizedAccessException("You are not authorized to update this routine");
        }

        // Validate time overlaps
        timeOverlapValidationService.validateTimeOverlaps(request.getActivities(), request.getRoutineType());

        // Update routine details
        routine.setName(request.getName());
        routine.setDescription(request.getDescription());
        routine.setRoutineType(request.getRoutineType());

        // Deactivate existing activities
        routine.getActivities().forEach(activity -> activity.setIsActive(false));

        // Create new activities
        List<RoutineActivity> newActivities = request.getActivities().stream()
                .map(activityRequest -> {
                    RoutineActivity activity = new RoutineActivity(
                            routine,
                            activityRequest.getActivityName(),
                            activityRequest.getActivityType(),
                            activityRequest.getStartTime(),
                            activityRequest.getEndTime()
                    );
                    activity.setDescription(activityRequest.getDescription());
                    activity.setDayOfWeek(activityRequest.getDayOfWeek());
                    activity.setInstructions(activityRequest.getInstructions());
                    return activity;
                })
                .collect(Collectors.toList());

        routine.getActivities().addAll(newActivities);

        Routine updatedRoutine = routineRepository.save(routine);

        return mapToRoutineResponse(updatedRoutine);
    }

    @Override
    @Transactional(readOnly = true)
    public RoutineResponse getRoutineById(Long routineId) {
        Routine routine = routineRepository.findByIdAndIsActiveTrue(routineId)
                .orElseThrow(() -> new RoutineNotFoundException("Routine not found with ID: " + routineId));

        return mapToRoutineResponse(routine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoutineResponse> getRoutinesByDoctor(Long doctorId) {
        List<Routine> routines = routineRepository.findByDoctorIdAndIsActiveTrue(doctorId);

        return routines.stream()
                .map(this::mapToRoutineResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRoutine(Long routineId, Long doctorId) {
        Routine routine = routineRepository.findByIdAndIsActiveTrue(routineId)
                .orElseThrow(() -> new RoutineNotFoundException("Routine not found with ID: " + routineId));

        // Check if doctor owns this routine
        if (!routine.getDoctorId().equals(doctorId)) {
            throw new UnauthorizedAccessException("You are not authorized to delete this routine");
        }

        // Soft delete routine and its activities
        routine.setIsActive(false);
        routine.getActivities().forEach(activity -> activity.setIsActive(false));

        // Deactivate patient assignments
        routine.getPatientRoutines().forEach(pr -> pr.setIsActive(false));

        routineRepository.save(routine);
    }

    @Override
    public void assignRoutineToPatient(AssignRoutineRequest request) {
        // Check if routine exists and is active
        Routine routine = routineRepository.findByIdAndIsActiveTrue(request.getRoutineId())
                .orElseThrow(() -> new RoutineNotFoundException("Routine not found with ID: " + request.getRoutineId()));

        // Check if already assigned
        patientRoutineRepository.findByPatientIdAndRoutineIdAndIsActiveTrue(
                        request.getPatientId(), request.getRoutineId())
                .ifPresent(pr -> {
                    throw new RoutineAlreadyAssignedException("Routine is already assigned to this patient");
                });

        // Create patient routine assignment
        PatientRoutine patientRoutine = new PatientRoutine(request.getPatientId(), routine);
        patientRoutineRepository.save(patientRoutine);
    }

    @Override
    public void unassignRoutineFromPatient(Long patientId, Long routineId) {
        PatientRoutine patientRoutine = patientRoutineRepository
                .findByPatientIdAndRoutineIdAndIsActiveTrue(patientId, routineId)
                .orElseThrow(() -> new RoutineNotFoundException("Routine assignment not found"));

        patientRoutine.setIsActive(false);
        patientRoutineRepository.save(patientRoutine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoutineResponse> getPatientRoutines(Long patientId) {
        List<Routine> routines = routineRepository.findActiveRoutinesByPatientId(patientId);

        return routines.stream()
                .map(this::mapToRoutineResponse)
                .collect(Collectors.toList());
    }

    private RoutineResponse mapToRoutineResponse(Routine routine) {
        RoutineResponse response = new RoutineResponse();
        response.setId(routine.getId());
        response.setName(routine.getName());
        response.setDescription(routine.getDescription());
        response.setDoctorId(routine.getDoctorId());
        response.setRoutineType(routine.getRoutineType());
        response.setIsActive(routine.getIsActive());
        response.setCreatedAt(routine.getCreatedAt());
        response.setUpdatedAt(routine.getUpdatedAt());

        List<ActivityResponse> activityResponses = routine.getActivities().stream()
                .filter(RoutineActivity::getIsActive)
                .map(this::mapToActivityResponse)
                .collect(Collectors.toList());

        response.setActivities(activityResponses);

        return response;
    }

    private ActivityResponse mapToActivityResponse(RoutineActivity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setActivityName(activity.getActivityName());
        response.setActivityType(activity.getActivityType());
        response.setDescription(activity.getDescription());
        response.setStartTime(activity.getStartTime());
        response.setEndTime(activity.getEndTime());
        response.setDayOfWeek(activity.getDayOfWeek());
        response.setInstructions(activity.getInstructions());
        response.setIsActive(activity.getIsActive());

        return response;
    }
}
