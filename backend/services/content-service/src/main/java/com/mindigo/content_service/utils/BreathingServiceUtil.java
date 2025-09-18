package com.mindigo.content_service.utils;

import com.mindigo.content_service.exceptions.breathing.ExerciseNotFound;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.models.breathing.BreathingExercise;
import com.mindigo.content_service.models.breathing.BreathingTask;
import com.mindigo.content_service.models.breathing.UserSpecificExercise;
import com.mindigo.content_service.repositories.breathing.BreathingExerciseRepository;
import com.mindigo.content_service.repositories.breathing.UserSpecificExerciseRepository;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BreathingServiceUtil {
    public String buildPatternFromTasks(List<BreathingTask> tasks) {
        return tasks.stream()
                .sorted(Comparator.comparingInt(BreathingTask::getOrder))
                .map(task -> String.valueOf(task.getDuration()))
                .collect(Collectors.joining("-"));
    }

    public UserSpecificExercise findUserExerciseOrThrow(Long userId,
                                                        Long exerciseId,
                                                        UserSpecificExerciseRepository repository) {
        return repository
                .findByUserIdAndExerciseId(userId, exerciseId)
                .orElseThrow(() -> new InvalidRequestException(
                        String.format("Exercise with id %d is not associated with user %d", exerciseId, userId)));
    }

    public BreathingExercise findExerciseOrThrow(Long exerciseId,
                                                 BreathingExerciseRepository repository) {
        return repository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFound("Exercise with id " + exerciseId + " not found"));
    }


}
