package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.breathing.*;
import com.mindigo.content_service.exceptions.breathing.ExerciseNotFound;
import com.mindigo.content_service.exceptions.breathing.InvalidRequestException;
import com.mindigo.content_service.models.*;
import com.mindigo.content_service.repositories.BreathingExerciseRepository;
import com.mindigo.content_service.repositories.BreathingSessionRepository;
import com.mindigo.content_service.repositories.UserSpecificExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BreathingService {

    private final BreathingExerciseRepository breathingExerciseRepository;
    private final UserSpecificExerciseRepository userSpecificExerciseRepository;
    private final BreathingSessionRepository breathingSessionRepository;

    /* ---------- Private Mapping Helpers ---------- */

    private BreathingTaskResponse mapToBreathingTaskResponse(BreathingTask task) {
        return BreathingTaskResponse.builder()
                .duration(task.getDuration())
                .type(task.getType().toString().toLowerCase())
                .order(task.getOrder())
                .build();
    }

    private CycleResponse buildCycleResponse(Cycle cycle) {
        List<BreathingTaskResponse> taskResponses = cycle.getBreathingTasks()
                .stream()
                .map(this::mapToBreathingTaskResponse)
                .toList();

        return CycleResponse.builder()
                .duration(cycle.getDuration())
                .task(taskResponses)
                .build();
    }

    private BreathingResponse buildResponse(BreathingExercise exercise) {
        return BreathingResponse.builder()
                .id(exercise.getId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .pattern(exercise.getPattern())
                .duration(exercise.getDuration())
                .cycle(buildCycleResponse(exercise.getCycle()))
                .build();
    }

    private BreathingSessionResponse mapToBreathingSessionResponse(BreathingSession session) {
        return BreathingSessionResponse.builder()
                .exerciseId(session.getExercise().getId())
                .exerciseTitle(session.getExercise().getTitle())
                .totalCycles(session.getTotalCycles())
                .completedCycles(session.getCompletedCycles())
                .date(session.getDate())
                .duration(session.getDuration())
                .build();
    }

    private String buildPattern(List<BreathingTask> tasks) {
        return tasks.stream()
                .sorted(Comparator.comparingInt(BreathingTask::getOrder))
                .map(task -> String.valueOf(task.getDuration()))
                .collect(Collectors.joining("-"));
    }

    /* ---------- Validation Helpers ---------- */

    private static List<CustomTaskRequest> validateCustomTasks(CustomCycleRequest request) {
        List<CustomTaskRequest> tasks = request.getTask();
        if (tasks == null || tasks.isEmpty()) {
            throw new InvalidRequestException("Task list cannot be null or empty");
        }

        List<String> validTypes = List.of("INHALE", "EXHALE", "HOLD");
        Set<Integer> visitedOrders = new HashSet<>();

        for (CustomTaskRequest task : tasks) {
            if (task.getType() == null || task.getDuration() == null || task.getOrder() == null) {
                throw new InvalidRequestException("Task type, duration, and order must be non-null");
            }

            if (task.getDuration() <= 0 ||
                    task.getOrder() < 0 ||
                    task.getOrder() > tasks.size() ||
                    !validTypes.contains(task.getType().toUpperCase())) {
                throw new InvalidRequestException("Invalid task: duration must be positive, order valid, and type one of " + validTypes);
            }

            if (!visitedOrders.add(task.getOrder())) {
                throw new InvalidRequestException("Duplicate task order: " + task.getOrder());
            }
        }
        return tasks;
    }

    private void validateBreathingSessionRequest(BreathingSessionRequest request) {
        if (request.getExerciseId() == null ||
                request.getCompletedCycles() == null ||
                request.getTotalCycles() == null ||
                request.getDate() == null ||
                request.getDuration() == null) {
            throw new InvalidRequestException("All fields must be non-null");
        }

        if (request.getExerciseId() < 1 ||
                request.getCompletedCycles() < 1 ||
                request.getTotalCycles() < 1 ||
                request.getDuration() < 1) {
            throw new InvalidRequestException("All numeric fields must be > 0");
        }

        if (request.getCompletedCycles() > request.getTotalCycles()) {
            throw new InvalidRequestException("completedCycles cannot exceed totalCycles");
        }
    }

    /* ---------- Public Service Methods ---------- */

    @Transactional
    public List<BreathingResponse> getBreathingOptions(Long userId) {
        List<UserSpecificExercise> userExercises = userSpecificExerciseRepository.findAllByUserId(userId);

        if (userExercises.isEmpty()) {
            List<BreathingExercise> defaultExercises = breathingExerciseRepository.findAllByIsCustomFalse();
            List<BreathingResponse> responses = new ArrayList<>();

            for (BreathingExercise exercise : defaultExercises) {
                exercise.getUserSpecificExercise().add(
                        UserSpecificExercise.builder()
                                .userId(userId)
                                .exercise(exercise)
                                .build()
                );
                responses.add(buildResponse(exercise));
            }
            breathingExerciseRepository.saveAll(defaultExercises);
            return responses;
        }

        return userExercises.stream()
                .map(ue -> buildResponse(ue.getExercise()))
                .toList();
    }

    @Transactional
    public BreathingResponse customizeBreathingExercise(Long userId, CustomBreathingRequest request) {
        if (request == null || request.getCycle() == null || request.getId() == null) {
            throw new InvalidRequestException("Request, cycle, or exercise ID cannot be null");
        }

        BreathingExercise exercise = breathingExerciseRepository.findById(request.getId())
                .orElseThrow(() -> new ExerciseNotFound("Exercise with id " + request.getId() + " not found"));

        CustomCycleRequest cycleRequest = request.getCycle();
        if (cycleRequest.getDuration() <= 0) {
            throw new InvalidRequestException("Invalid cycle duration for exercise " + request.getId());
        }

        Cycle newCycle = Cycle.builder()
                .duration(cycleRequest.getDuration())
                .build();

        List<CustomTaskRequest> tasks = validateCustomTasks(cycleRequest);

        if (Boolean.TRUE.equals(exercise.getIsCustomizable())) {
            List<BreathingTask> newTasks = tasks.stream()
                    .map(task -> BreathingTask.builder()
                            .duration(task.getDuration())
                            .type(BreathingType.valueOf(task.getType().toUpperCase()))
                            .build())
                    .toList();

            newCycle.setBreathingTasks(new HashSet<>(newTasks));
            exercise.setPattern(buildPattern(newTasks));
        }

        exercise.setCycle(newCycle);
        breathingExerciseRepository.save(exercise);

        return buildResponse(exercise);
    }

    @Transactional
    public BreathingSessionResponse saveBreathingSession(Long userId, BreathingSessionRequest request) {
        validateBreathingSessionRequest(request);

        BreathingExercise exercise = breathingExerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ExerciseNotFound("Exercise with id " + request.getExerciseId() + " not found"));

        boolean exists = userSpecificExerciseRepository.existsByUserIdAndExerciseId(userId, request.getExerciseId());
        if (!exists) {
            throw new InvalidRequestException("User is not certified for exercise " + request.getExerciseId());
        }

        BreathingSession session = BreathingSession.builder()
                .userId(userId)
                .exercise(exercise)
                .completedCycles(request.getCompletedCycles())
                .totalCycles(request.getTotalCycles())
                .duration(request.getDuration())
                .date(request.getDate())
                .build();

        BreathingSession saved = breathingSessionRepository.save(session);
        return mapToBreathingSessionResponse(saved);
    }

    public BreathingSessionResponse getLastSession(Long userId, LocalDate date) {
        BreathingSession lastSession = breathingSessionRepository
                .findTopByUserIdAndDateOrderByCreatedAtDesc(userId, date)
                .orElseThrow(() -> new InvalidRequestException("No session found for user " + userId + " on " + date));

        return mapToBreathingSessionResponse(lastSession);
    }
}
