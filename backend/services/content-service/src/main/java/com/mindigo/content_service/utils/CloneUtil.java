package com.mindigo.content_service.utils;

import com.mindigo.content_service.models.BreathingExercise;
import com.mindigo.content_service.models.BreathingTask;
import com.mindigo.content_service.models.Cycle;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CloneUtil {
    public List<BreathingTask> cloneTasksForNewCycle(List<BreathingTask> originalTasks, Cycle newCycle) {
        return originalTasks.stream()
                .map(originalTask -> BreathingTask.builder()
                        .duration(originalTask.getDuration())
                        .type(originalTask.getType())
                        .order(originalTask.getOrder())
                        .cycle(newCycle)  // Associate with new cycle
                        .build())
                .toList();
    }

    public BreathingExercise cloneExerciseAsCustom(BreathingExercise original) {
        return BreathingExercise.builder()
                .title(original.getTitle())
                .description(original.getDescription())
                .pattern(original.getPattern())
                .duration(original.getDuration())
                .isCustom(true)
                .isCustomizable(original.getIsCustomizable())
                .build();
    }
}
