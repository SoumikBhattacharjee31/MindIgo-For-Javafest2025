package com.mindigo.content_service.utils;

import com.mindigo.content_service.dto.breathing.BreathingResponse;
import com.mindigo.content_service.dto.breathing.BreathingSessionResponse;
import com.mindigo.content_service.dto.breathing.BreathingTaskResponse;
import com.mindigo.content_service.dto.breathing.CycleResponse;
import com.mindigo.content_service.models.BreathingExercise;
import com.mindigo.content_service.models.BreathingSession;
import com.mindigo.content_service.models.BreathingTask;
import com.mindigo.content_service.models.Cycle;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MappingUtil {
    private BreathingTaskResponse mapToTaskResponse(BreathingTask task) {
        return BreathingTaskResponse.builder()
                .duration(task.getDuration())
                .type(task.getType().toString().toLowerCase())
                .order(task.getOrder())
                .build();
    }

    private CycleResponse mapToCycleResponse(Cycle cycle) {
        List<BreathingTaskResponse> taskResponses = cycle.getBreathingTasks()
                .stream()
                .map(this::mapToTaskResponse)
                .toList();

        return CycleResponse.builder()
                .duration(cycle.getDuration())
                .task(taskResponses)
                .build();
    }

    public BreathingResponse mapToBreathingResponse(BreathingExercise exercise) {
        return BreathingResponse.builder()
                .id(exercise.getId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .pattern(exercise.getPattern())
                .duration(exercise.getDuration())
                .cycle(mapToCycleResponse(exercise.getCycle()))
                .build();
    }

    public BreathingSessionResponse mapToSessionResponse(BreathingSession session) {
        return BreathingSessionResponse.builder()
                .exerciseId(session.getExercise().getId())
                .exerciseTitle(session.getExercise().getTitle())
                .totalCycles(session.getTotalCycles())
                .completedCycles(session.getCompletedCycles())
                .date(session.getDate())
                .duration(session.getDuration())
                .build();
    }

}
