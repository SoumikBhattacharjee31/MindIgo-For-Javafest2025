package com.mindigo.content_service.services;


import com.mindigo.content_service.dto.*;
import com.mindigo.content_service.exceptions.CourseDayNotFoundException;
import com.mindigo.content_service.exceptions.TaskCreationException;
import com.mindigo.content_service.models.*;
import com.mindigo.content_service.repositories.CourseDayRepository;
import com.mindigo.content_service.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final CourseDayRepository courseDayRepository;

    @Transactional
    public TaskResponse addTask(Long userId, Long dayId, TaskRequest taskRequest) {
        validateTaskRequest(taskRequest);

        CourseDay courseDay = courseDayRepository.findById(dayId)
                .orElseThrow(() -> new CourseDayNotFoundException("Course day with ID " + dayId + " not found"));

        // Check if user is authorized to add task to this course day
        if (!courseDay.getCourse().getOwnerId().equals(userId)) {
            throw new TaskCreationException("User not authorized to add tasks to this course day");
        }

        // Check for duplicate title within the same course day
        if (taskRepository.existsByCourseDayIdAndTitle(dayId, taskRequest.getTitle())) {
            throw new TaskCreationException("A task with the title '" + taskRequest.getTitle() + "' already exists in this course day");
        }

        // Validate order index
        if (taskRequest.getOrderIndex() == null) {
            taskRequest.setOrderIndex(getNextOrderIndex(dayId));
        } else if (taskRepository.existsByCourseDayIdAndOrderIndex(dayId, taskRequest.getOrderIndex())) {
            throw new TaskCreationException("A task with order index " + taskRequest.getOrderIndex() + " already exists in this course day");
        }

        Task newTask = createTaskByType(taskRequest, courseDay);
        Task savedTask = taskRepository.save(newTask);

        log.info("Task {} created successfully for course day: {}", savedTask.getId(), dayId);
        return convertToTaskResponse(savedTask, userId);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskDetails(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskCreationException("Task with ID " + taskId + " not found"));

        return convertToTaskResponse(task, userId);
    }

    @Transactional(readOnly = true)
    public PagedTaskResponse listTasksByCourseDayId(Long userId, Long dayId, int page, int size) {
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("Invalid pagination parameters: page must be >= 0, size must be >= 1");
        }

        // Verify course day exists
        CourseDay courseDay = courseDayRepository.findById(dayId)
                .orElseThrow(() -> new CourseDayNotFoundException("Course day with ID " + dayId + " not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("orderIndex"));
        Page<Task> tasks = taskRepository.findByCourseDayId(dayId, pageable);

        List<TaskResponse> taskContent = tasks.getContent().stream()
                .map(task -> convertToTaskResponse(task, userId))
                .toList();

        return PagedTaskResponse.builder()
                .tasks(taskContent)
                .size(tasks.getSize())
                .page(tasks.getNumber())
                .totalElements(tasks.getTotalElements())
                .totalPages(tasks.getTotalPages())
                .build();
    }

    @Transactional
    public void removeTask(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskCreationException("Task with ID " + taskId + " not found"));

        if (!task.getCourseDay().getCourse().getOwnerId().equals(userId)) {
            throw new TaskCreationException("User not authorized to remove this task");
        }

        taskRepository.delete(task);
        log.info("Task {} removed successfully", taskId);
    }

    @Transactional
    public TaskResponse activateTask(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskCreationException("Task with ID " + taskId + " not found"));

        if (!task.getCourseDay().getCourse().getOwnerId().equals(userId)) {
            throw new TaskCreationException("User not authorized to activate this task");
        }

        task.setActive(true);
        Task savedTask = taskRepository.save(task);

        log.info("Task {} activated successfully", taskId);
        return convertToTaskResponse(savedTask, userId);
    }

    @Transactional
    public TaskResponse deactivateTask(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskCreationException("Task with ID " + taskId + " not found"));

        if (!task.getCourseDay().getCourse().getOwnerId().equals(userId)) {
            throw new TaskCreationException("User not authorized to deactivate this task");
        }

        task.setActive(false);
        Task savedTask = taskRepository.save(task);

        log.info("Task {} deactivated successfully", taskId);
        return convertToTaskResponse(savedTask, userId);
    }

    @Transactional
    public TaskResponse updateTask(Long userId, Long taskId, TaskRequest taskRequest) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskCreationException("Task with ID " + taskId + " not found"));

        if (!task.getCourseDay().getCourse().getOwnerId().equals(userId)) {
            throw new TaskCreationException("User not authorized to update this task");
        }

        // Verify task type consistency
        if (taskRequest.getType() != null && !taskRequest.getType().equals(task.getType())) {
            throw new TaskCreationException("Cannot change task type after creation");
        }

        // Check for duplicate title if title is being changed
        if (taskRequest.getTitle() != null && !taskRequest.getTitle().equals(task.getTitle())) {
            if (taskRepository.existsByCourseDayIdAndTitle(task.getCourseDay().getId(), taskRequest.getTitle())) {
                throw new TaskCreationException("A task with the title '" + taskRequest.getTitle() + "' already exists in this course day");
            }
        }

        // Check for duplicate order index if order is being changed
        if (taskRequest.getOrderIndex() != null && !taskRequest.getOrderIndex().equals(task.getOrderIndex())) {
            if (taskRepository.existsByCourseDayIdAndOrderIndex(task.getCourseDay().getId(), taskRequest.getOrderIndex())) {
                throw new TaskCreationException("A task with order index " + taskRequest.getOrderIndex() + " already exists in this course day");
            }
        }

        updateTaskFields(task, taskRequest);
        Task savedTask = taskRepository.save(task);

        log.info("Task {} updated successfully", taskId);
        return convertToTaskResponse(savedTask, userId);
    }

    @Transactional
    public PagedTaskResponse reorderTasks(Long userId, Long dayId, TaskOrderRequest orderRequest) {
        CourseDay courseDay = courseDayRepository.findById(dayId)
                .orElseThrow(() -> new CourseDayNotFoundException("Course day with ID " + dayId + " not found"));

        if (!courseDay.getCourse().getOwnerId().equals(userId)) {
            throw new TaskCreationException("User not authorized to reorder tasks in this course day");
        }

        // Validate all task IDs belong to the course day
        List<Task> tasks = taskRepository.findByCourseDayId(dayId);
        List<Long> existingTaskIds = tasks.stream().map(Task::getId).toList();

        for (TaskOrderItem orderItem : orderRequest.getTaskOrders()) {
            if (!existingTaskIds.contains(orderItem.getTaskId())) {
                throw new TaskCreationException("Task with ID " + orderItem.getTaskId() + " does not belong to course day " + dayId);
            }
        }

        // Update order indices
        for (TaskOrderItem orderItem : orderRequest.getTaskOrders()) {
            Task task = tasks.stream()
                    .filter(t -> t.getId().equals(orderItem.getTaskId()))
                    .findFirst()
                    .orElseThrow();
            task.setOrderIndex(orderItem.getOrderIndex());
        }

        taskRepository.saveAll(tasks);

        // Return updated task list
        return listTasksByCourseDayId(userId, dayId, 0, Integer.MAX_VALUE);
    }

    private Task createTaskByType(TaskRequest taskRequest, CourseDay courseDay) {
        return switch (taskRequest.getType()) {
            case VIDEO -> {
                VideoTaskRequest videoReq = (VideoTaskRequest) taskRequest;
                yield VideoTask.builder()
                        .courseDay(courseDay)
                        .title(videoReq.getTitle())
                        .description(videoReq.getDescription())
                        .orderIndex(videoReq.getOrderIndex())
                        .videoUrl(videoReq.getVideoUrl())
                        .durationSeconds(videoReq.getDurationSeconds())
                        .thumbnailUrl(videoReq.getThumbnailUrl())
                        .build();
            }
            case MEDITATION -> {
                MeditationTaskRequest meditationReq = (MeditationTaskRequest) taskRequest;
                yield MeditationTask.builder()
                        .courseDay(courseDay)
                        .title(meditationReq.getTitle())
                        .description(meditationReq.getDescription())
                        .orderIndex(meditationReq.getOrderIndex())
                        .audioUrl(meditationReq.getAudioUrl())
                        .durationMinutes(meditationReq.getDurationMinutes())
                        .instructions(meditationReq.getInstructions())
                        .meditationType(meditationReq.getMeditationType())
                        .build();
            }
            case REFLECTION -> {
                ReflectionTaskRequest reflectionReq = (ReflectionTaskRequest) taskRequest;
                yield ReflectionTask.builder()
                        .courseDay(courseDay)
                        .title(reflectionReq.getTitle())
                        .description(reflectionReq.getDescription())
                        .orderIndex(reflectionReq.getOrderIndex())
                        .prompt(reflectionReq.getPrompt())
                        .estimatedMinutes(reflectionReq.getEstimatedMinutes())
                        .allowVoiceResponse(reflectionReq.getAllowVoiceResponse())
                        .build();
            }
            case QUIZ -> {
                QuizTaskRequest quizReq = (QuizTaskRequest) taskRequest;
                yield QuizTask.builder()
                        .courseDay(courseDay)
                        .title(quizReq.getTitle())
                        .description(quizReq.getDescription())
                        .orderIndex(quizReq.getOrderIndex())
                        .instructions(quizReq.getInstructions())
                        .passPercentage(quizReq.getPassPercentage())
                        .timeLimitMinutes(quizReq.getTimeLimitMinutes())
                        .allowRetake(quizReq.getAllowRetake())
                        .build();
            }
            case EXERCISE -> {
                ExerciseTaskRequest exerciseReq = (ExerciseTaskRequest) taskRequest;
                yield ExerciseTask.builder()
                        .courseDay(courseDay)
                        .title(exerciseReq.getTitle())
                        .description(exerciseReq.getDescription())
                        .orderIndex(exerciseReq.getOrderIndex())
                        .instructions(exerciseReq.getInstructions())
                        .estimatedMinutes(exerciseReq.getEstimatedMinutes())
                        .difficultyLevel(exerciseReq.getDifficultyLevel())
                        .equipmentNeeded(exerciseReq.getEquipmentNeeded())
                        .build();
            }
        };
    }

    private void updateTaskFields(Task task, TaskRequest taskRequest) {
        // Update common fields
        if (taskRequest.getTitle() != null && !taskRequest.getTitle().trim().isEmpty()) {
            task.setTitle(taskRequest.getTitle());
        }
        if (taskRequest.getDescription() != null) {
            task.setDescription(taskRequest.getDescription());
        }
        if (taskRequest.getOrderIndex() != null) {
            task.setOrderIndex(taskRequest.getOrderIndex());
        }

        // Update type-specific fields
        switch (task.getType()) {
            case VIDEO -> updateVideoTaskFields((VideoTask) task, (VideoTaskRequest) taskRequest);
            case MEDITATION -> updateMeditationTaskFields((MeditationTask) task, (MeditationTaskRequest) taskRequest);
            case REFLECTION -> updateReflectionTaskFields((ReflectionTask) task, (ReflectionTaskRequest) taskRequest);
            case QUIZ -> updateQuizTaskFields((QuizTask) task, (QuizTaskRequest) taskRequest);
            case EXERCISE -> updateExerciseTaskFields((ExerciseTask) task, (ExerciseTaskRequest) taskRequest);
        }
    }

    private void updateVideoTaskFields(VideoTask task, VideoTaskRequest request) {
        if (request.getVideoUrl() != null) task.setVideoUrl(request.getVideoUrl());
        if (request.getDurationSeconds() != null) task.setDurationSeconds(request.getDurationSeconds());
        if (request.getThumbnailUrl() != null) task.setThumbnailUrl(request.getThumbnailUrl());
    }

    private void updateMeditationTaskFields(MeditationTask task, MeditationTaskRequest request) {
        if (request.getAudioUrl() != null) task.setAudioUrl(request.getAudioUrl());
        if (request.getDurationMinutes() != null) task.setDurationMinutes(request.getDurationMinutes());
        if (request.getInstructions() != null) task.setInstructions(request.getInstructions());
        if (request.getMeditationType() != null) task.setMeditationType(request.getMeditationType());
    }

    private void updateReflectionTaskFields(ReflectionTask task, ReflectionTaskRequest request) {
        if (request.getPrompt() != null) task.setPrompt(request.getPrompt());
        if (request.getEstimatedMinutes() != null) task.setEstimatedMinutes(request.getEstimatedMinutes());
        if (request.getAllowVoiceResponse() != null) task.setAllowVoiceResponse(request.getAllowVoiceResponse());
    }

    private void updateQuizTaskFields(QuizTask task, QuizTaskRequest request) {
        if (request.getInstructions() != null) task.setInstructions(request.getInstructions());
        if (request.getPassPercentage() != null) task.setPassPercentage(request.getPassPercentage());
        if (request.getTimeLimitMinutes() != null) task.setTimeLimitMinutes(request.getTimeLimitMinutes());
        if (request.getAllowRetake() != null) task.setAllowRetake(request.getAllowRetake());
    }

    private void updateExerciseTaskFields(ExerciseTask task, ExerciseTaskRequest request) {
        if (request.getInstructions() != null) task.setInstructions(request.getInstructions());
        if (request.getEstimatedMinutes() != null) task.setEstimatedMinutes(request.getEstimatedMinutes());
        if (request.getDifficultyLevel() != null) task.setDifficultyLevel(request.getDifficultyLevel());
        if (request.getEquipmentNeeded() != null) task.setEquipmentNeeded(request.getEquipmentNeeded());
    }

    private TaskResponse convertToTaskResponse(Task task, Long userId) {
        boolean canEdit = task.getCourseDay().getCourse().getOwnerId().equals(userId);

        TaskResponse.TaskResponseBuilder builder = TaskResponse.builder()
                .id(task.getId())
                .type(task.getType())
                .title(task.getTitle())
                .description(task.getDescription())
                .orderIndex(task.getOrderIndex())
                .active(task.getActive())
                .canEdit(canEdit);

        // Add type-specific fields
        switch (task.getType()) {
            case VIDEO -> {
                VideoTask videoTask = (VideoTask) task;
                builder.videoUrl(videoTask.getVideoUrl())
                        .durationSeconds(videoTask.getDurationSeconds())
                        .thumbnailUrl(videoTask.getThumbnailUrl());
            }
            case MEDITATION -> {
                MeditationTask meditationTask = (MeditationTask) task;
                builder.audioUrl(meditationTask.getAudioUrl())
                        .durationMinutes(meditationTask.getDurationMinutes())
                        .instructions(meditationTask.getInstructions())
                        .meditationType(meditationTask.getMeditationType());
            }
            case REFLECTION -> {
                ReflectionTask reflectionTask = (ReflectionTask) task;
                builder.prompt(reflectionTask.getPrompt())
                        .estimatedMinutes(reflectionTask.getEstimatedMinutes())
                        .allowVoiceResponse(reflectionTask.getAllowVoiceResponse());
            }
            case QUIZ -> {
                QuizTask quizTask = (QuizTask) task;
                builder.instructions(quizTask.getInstructions())
                        .passPercentage(quizTask.getPassPercentage())
                        .timeLimitMinutes(quizTask.getTimeLimitMinutes())
                        .allowRetake(quizTask.getAllowRetake());
            }
            case EXERCISE -> {
                ExerciseTask exerciseTask = (ExerciseTask) task;
                builder.instructions(exerciseTask.getInstructions())
                        .estimatedMinutes(exerciseTask.getEstimatedMinutes())
                        .difficultyLevel(exerciseTask.getDifficultyLevel())
                        .equipmentNeeded(exerciseTask.getEquipmentNeeded());
            }
        }

        return builder.build();
    }

    private void validateTaskRequest(TaskRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new TaskCreationException("Task title cannot be empty");
        }
        if (request.getType() == null) {
            throw new TaskCreationException("Task type is mandatory");
        }

        // Validate type-specific fields
        switch (request.getType()) {
            case VIDEO -> {
                VideoTaskRequest videoReq = (VideoTaskRequest) request;
                if (videoReq.getVideoUrl() == null || videoReq.getVideoUrl().trim().isEmpty()) {
                    throw new TaskCreationException("Video URL is mandatory for video tasks");
                }
            }
            case MEDITATION -> {
                MeditationTaskRequest meditationReq = (MeditationTaskRequest) request;
                if (meditationReq.getDurationMinutes() == null || meditationReq.getDurationMinutes() < 1) {
                    throw new TaskCreationException("Duration in minutes is mandatory and must be at least 1 for meditation tasks");
                }
            }
            case REFLECTION -> {
                ReflectionTaskRequest reflectionReq = (ReflectionTaskRequest) request;
                if (reflectionReq.getPrompt() == null || reflectionReq.getPrompt().trim().isEmpty()) {
                    throw new TaskCreationException("Prompt is mandatory for reflection tasks");
                }
            }
            case EXERCISE -> {
                ExerciseTaskRequest exerciseReq = (ExerciseTaskRequest) request;
                if (exerciseReq.getInstructions() == null || exerciseReq.getInstructions().trim().isEmpty()) {
                    throw new TaskCreationException("Instructions are mandatory for exercise tasks");
                }
            }
        }
    }

    private Integer getNextOrderIndex(Long dayId) {
        Integer maxOrderIndex = taskRepository.findMaxOrderIndexByCourseDayId(dayId);
        return maxOrderIndex != null ? maxOrderIndex + 1 : 0;
    }
}
