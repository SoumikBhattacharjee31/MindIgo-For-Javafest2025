package com.mindigo.content_service.utils;

import com.mindigo.content_service.dto.breathing.BreathingSessionRequest;
import com.mindigo.content_service.dto.breathing.CustomBreathingRequest;
import com.mindigo.content_service.dto.breathing.CustomTaskRequest;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class ValidatorUtil {
    private final Set<String> VALID_BREATHING_TYPES = Set.of("INHALE", "EXHALE", "HOLD");

    private void validateTaskFields(CustomTaskRequest task) {
        if (task.getType() == null || task.getDuration() == null || task.getOrder() == null) {
            throw new InvalidRequestException("Task type, duration, and order must be non-null");
        }
    }

    private void validateTaskValues(CustomTaskRequest task, int totalTasks) {
        if (task.getDuration() <= 0) {
            throw new InvalidRequestException("Task duration must be positive");
        }

        if (task.getOrder() < 1 || task.getOrder() > totalTasks) {
            throw new InvalidRequestException(
                    String.format("Task order must be between 1 and %d (inclusive)", totalTasks));
        }

        if (!VALID_BREATHING_TYPES.contains(task.getType().toUpperCase())) {
            throw new InvalidRequestException(
                    String.format("Task type must be one of: %s", VALID_BREATHING_TYPES));
        }
    }

    private boolean hasNullFields(BreathingSessionRequest request) {
        return request.getExerciseId() == null ||
                request.getCompletedCycles() == null ||
                request.getTotalCycles() == null ||
                request.getDate() == null ||
                request.getDuration() == null;
    }

    private boolean hasInvalidValues(BreathingSessionRequest request) {
        return request.getExerciseId() < 1 ||
                request.getCompletedCycles() < 1 ||
                request.getTotalCycles() < 1 ||
                request.getDuration() < 1;
    }

    public void validateCustomizationRequest(CustomBreathingRequest request) {
        if (request == null) {
            throw new InvalidRequestException("Customization request cannot be null");
        }
        if (request.getId() == null) {
            throw new InvalidRequestException("Exercise ID cannot be null");
        }
        if (request.getCycle() == null) {
            throw new InvalidRequestException("Cycle configuration cannot be null");
        }
        if (request.getDuration() <= 0) {
            throw new InvalidRequestException("Exercise duration must be at least 1 minutes");
        }
    }

    public void validateCustomTasks(List<CustomTaskRequest> tasks) {
        if (CollectionUtils.isEmpty(tasks)) {
            throw new InvalidRequestException("Task list cannot be null or empty");
        }

        Set<Integer> orders = new HashSet<>();

        for (CustomTaskRequest task : tasks) {
            validateTaskFields(task);
            validateTaskValues(task, tasks.size());

            if (!orders.add(task.getOrder())) {
                throw new InvalidRequestException("Duplicate task order: " + task.getOrder());
            }
        }
    }

    public void validateBreathingSessionRequest(BreathingSessionRequest request) {
        if (hasNullFields(request)) {
            throw new InvalidRequestException("All session fields must be non-null");
        }

        if (hasInvalidValues(request)) {
            throw new InvalidRequestException("All numeric fields must be positive");
        }

        if (request.getCompletedCycles() > request.getTotalCycles()) {
            throw new InvalidRequestException("Completed cycles cannot exceed total cycles");
        }
    }
}
