package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.breathing.*;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.models.breathing.*;
import com.mindigo.content_service.repositories.breathing.BreathingExerciseRepository;
import com.mindigo.content_service.repositories.breathing.BreathingSessionRepository;
import com.mindigo.content_service.repositories.breathing.UserSpecificExerciseRepository;
import com.mindigo.content_service.utils.BreathingServiceUtil;
import com.mindigo.content_service.utils.CloneUtil;
import com.mindigo.content_service.utils.MappingUtil;
import com.mindigo.content_service.utils.ValidatorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BreathingService {
    private final BreathingExerciseRepository breathingExerciseRepository;
    private final UserSpecificExerciseRepository userSpecificExerciseRepository;
    private final BreathingSessionRepository breathingSessionRepository;

    private final ValidatorUtil validatorUtil;
    private final MappingUtil mappingUtil;
    private final BreathingServiceUtil util;
    private final CloneUtil cloneUtil;

    @Transactional
    public List<BreathingResponse> getBreathingOptions(Long userId) {
        List<UserSpecificExercise> userExercises = userSpecificExerciseRepository.findAllByUserId(userId);

        // Initialize default exercises for new users
        if (userExercises.isEmpty()) {
            log.info("Initializing default breathing exercises for user: {}", userId);
            userExercises = initializeDefaultExercisesForUser(userId);
        }

        return userExercises.stream()
                .map(userExercise -> mappingUtil.mapToBreathingResponse(userExercise.getExercise()))
                .toList();
    }

    @Transactional
    public BreathingResponse customizeBreathingExercise(Long userId,
                                                        CustomBreathingRequest request) {
        validatorUtil.validateCustomizationRequest(request);

        UserSpecificExercise userSpecificExercise = util.findUserExerciseOrThrow(userId, request.getId(),userSpecificExerciseRepository);
        BreathingExercise originalExercise = userSpecificExercise.getExercise();

        log.debug("Customizing exercise {} for user {}. IsCustom: {}, IsCustomizable: {}",
                originalExercise.getId(), userId, originalExercise.getIsCustom(), originalExercise.getIsCustomizable());

        // Create or update the customized exercise
        BreathingExercise customizedExercise = createCustomizedExercise(originalExercise, request);

        // Update the relationship if we created a new exercise
        if (!originalExercise.getIsCustom()) {
            log.debug("Creating new custom exercise from default template for user {}", userId);
            userSpecificExercise.setExercise(customizedExercise);
            customizedExercise.setUserSpecificExercise(List.of(userSpecificExercise));
        } else {
            log.debug("Updating existing custom exercise {} for user {}", originalExercise.getId(), userId);
        }

        BreathingExercise savedExercise = breathingExerciseRepository.save(customizedExercise);

        log.info("Successfully customized breathing exercise {} for user {}", savedExercise.getId(), userId);
        return mappingUtil.mapToBreathingResponse(savedExercise);
    }

    @Transactional
    public BreathingSessionResponse saveBreathingSession(Long userId, BreathingSessionRequest request) {
        validatorUtil.validateBreathingSessionRequest(request);

        // Verify exercise exists and user has access
        BreathingExercise exercise = util.findExerciseOrThrow(request.getExerciseId(),breathingExerciseRepository);
        verifyUserExerciseAccess(userId, request.getExerciseId());

        BreathingSession session = BreathingSession.builder()
                .userId(userId)
                .exercise(exercise)
                .completedCycles(request.getCompletedCycles())
                .totalCycles(request.getTotalCycles())
                .duration(request.getDuration())
                .date(request.getDate())
                .build();

        BreathingSession savedSession = breathingSessionRepository.save(session);
        log.info("Saved breathing session for user {} with exercise {}", userId, exercise.getId());

        return mappingUtil.mapToSessionResponse(savedSession);
    }

    @Transactional(readOnly = true)
    public BreathingSessionResponse getLastSession(Long userId, LocalDate date) {
        Optional<BreathingSession> lastSession = breathingSessionRepository
                .findTopByUserIdAndDateOrderByCreatedAtDesc(userId, date);
        return lastSession.map(mappingUtil::mapToSessionResponse).orElse(null);
    }

    // ============ Private Helper Methods ============

    private List<UserSpecificExercise> initializeDefaultExercisesForUser(Long userId) {
        List<BreathingExercise> defaultExercises = breathingExerciseRepository.findAllByIsCustomFalse();

        List<UserSpecificExercise> userExercises = defaultExercises.stream()
                .map(exercise -> UserSpecificExercise.builder()
                        .userId(userId)
                        .exercise(exercise)
                        .build())
                .toList();

        return userSpecificExerciseRepository.saveAll(userExercises);
    }

    private BreathingExercise createCustomizedExercise(BreathingExercise originalExercise,
                                                       CustomBreathingRequest request) {
        CustomCycleRequest cycleRequest = request.getCycle();

        // Create new exercise if original is not custom
        BreathingExercise targetExercise = originalExercise.getIsCustom() ?
                originalExercise : cloneUtil.cloneExerciseAsCustom(originalExercise);

        // Create new cycle with proper task handling
        Cycle newCycle = createCustomCycle(cycleRequest,
                originalExercise.getIsCustomizable(),
                originalExercise.getCycle().getBreathingTasks());

        // Update exercise with new cycle and pattern
        targetExercise.setCycle(newCycle);
        targetExercise.setDuration(request.getDuration());

        if (originalExercise.getIsCustomizable()) {
            targetExercise.setPattern(util.buildPatternFromTasks(newCycle.getBreathingTasks()));
        }

        return targetExercise;
    }

    private List<BreathingTask> createTasksFromRequest(List<CustomTaskRequest> taskRequests, Cycle cycle) {
        return taskRequests.stream()
                .map(taskRequest -> BreathingTask.builder()
                        .duration(taskRequest.getDuration())
                        .type(BreathingType.valueOf(taskRequest.getType().toUpperCase()))
                        .order(taskRequest.getOrder())
                        .cycle(cycle)
                        .build())
                .toList();
    }

    private Cycle createCustomCycle(CustomCycleRequest cycleRequest,
                                    Boolean isCustomizable,
                                    List<BreathingTask> originalTasks) {
        Cycle cycle = Cycle.builder().build();

        List<BreathingTask> tasks;

        if (!isCustomizable || CollectionUtils.isEmpty(cycleRequest.getTask())) {
            tasks = cloneUtil.cloneTasksForNewCycle(originalTasks, cycle);
        } else {
            validatorUtil.validateCustomTasks(cycleRequest.getTask());
            tasks = createTasksFromRequest(cycleRequest.getTask(), cycle);
        }

        int calculatedDuration = tasks.stream().mapToInt(BreathingTask::getDuration).sum();
        cycle.setDuration(calculatedDuration);
        cycle.setBreathingTasks(tasks);
        return cycle;
    }

    private void verifyUserExerciseAccess(Long userId, Long exerciseId) {
        if (!userSpecificExerciseRepository.existsByUserIdAndExerciseId(userId, exerciseId)) {
            throw new InvalidRequestException(
                    String.format("User %d does not have access to exercise %d", userId, exerciseId));
        }
    }
}