package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.*;
import com.mindigo.content_service.exceptions.TaskCreationException;
import com.mindigo.content_service.exceptions.CourseDayNotFoundException;
import com.mindigo.content_service.services.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content/task")
@Tag(name = "Task Section on Content Service", description = "Manage tasks: create, remove, activate, list, edit, and view details")
@Slf4j
@RequiredArgsConstructor
@Validated
public class TaskController {

    private final TaskService taskService;

    private boolean isNotAuthorized(String role) {
        return !role.equalsIgnoreCase("COUNSELOR") && !role.equalsIgnoreCase("ADMIN");
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get task details", description = "Retrieves details of a specific task")
    @ApiResponse(responseCode = "200", description = "Task details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @ApiResponse(responseCode = "400", description = "Invalid userId")
    public ResponseEntity<ApiResponseClass<TaskResponse>> getTaskDetails(
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long taskId) {
        try {
            TaskResponse response = taskService.getTaskDetails(taskId, Long.parseLong(userId));
            log.info("Task {} details retrieved successfully for user: {}", taskId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Task details retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (TaskCreationException e) {
            log.error("Task not found: {}", taskId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Error retrieving task details: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/list/day/{dayId}")
    @Operation(summary = "List tasks by Course Day Id", description = "Lists all tasks for a specific course day with pagination")
    @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid userId or pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedTaskResponse>> listTasksByCourseDayId(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @PathVariable Long dayId) {
        try {
            PagedTaskResponse tasks = taskService.listTasksByCourseDayId(Long.parseLong(userId), dayId, page, size);
            log.info("Tasks retrieved successfully for dayId: {}", dayId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(tasks, "Tasks retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (Exception e) {
            log.error("Error listing tasks for dayId {}: {}", dayId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @PostMapping("/add/day/{dayId}")
    @Operation(summary = "Create a new task", description = "Allows COUNSELOR or ADMIN to create a task for a course day")
    @ApiResponse(responseCode = "201", description = "Task created successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<TaskResponse>> addTask(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long dayId,
            @Valid @RequestBody TaskRequest request) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized task creation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            TaskResponse response = taskService.addTask(Long.parseLong(userId), dayId, request);
            log.info("Task '{}' created successfully by user: {}", request.getTitle(), userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseClass.success(response, "Task created successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (TaskCreationException | CourseDayNotFoundException e) {
            log.error("Validation error creating task: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error creating task: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Remove a task", description = "Allows COUNSELOR or ADMIN to remove a task")
    @ApiResponse(responseCode = "200", description = "Task removed successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Task not found")
    public ResponseEntity<ApiResponseClass<Void>> removeTask(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long taskId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized task removal attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            taskService.removeTask(Long.parseLong(userId), taskId);
            log.info("Task {} removed successfully by user: {}", taskId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(null, "Task removed successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (TaskCreationException e) {
            log.error("Task not found: {}", taskId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Unexpected error removing task: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PatchMapping("/activate/{taskId}")
    @Operation(summary = "Activate a task", description = "Allows COUNSELOR or ADMIN to activate a task")
    @ApiResponse(responseCode = "200", description = "Task activated successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Task not found")
    public ResponseEntity<ApiResponseClass<TaskResponse>> activateTask(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long taskId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized task activation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            TaskResponse response = taskService.activateTask(Long.parseLong(userId), taskId);
            log.info("Task {} activated successfully by user: {}", taskId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Task activated successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (TaskCreationException e) {
            log.error("Error activating task {}: {}", taskId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error activating task: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PatchMapping("/deactivate/{taskId}")
    @Operation(summary = "Deactivate a task", description = "Allows COUNSELOR or ADMIN to deactivate a task")
    @ApiResponse(responseCode = "200", description = "Task deactivated successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Task not found")
    public ResponseEntity<ApiResponseClass<TaskResponse>> deactivateTask(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long taskId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized task deactivation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            TaskResponse response = taskService.deactivateTask(Long.parseLong(userId), taskId);
            log.info("Task {} deactivated successfully by user: {}", taskId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Task deactivated successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (TaskCreationException e) {
            log.error("Error deactivating task {}: {}", taskId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error deactivating task: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PutMapping("/edit/{taskId}")
    @Operation(summary = "Update a task", description = "Allows COUNSELOR or ADMIN to update a task")
    @ApiResponse(responseCode = "200", description = "Task updated successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<TaskResponse>> updateTask(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long taskId,
            @Valid @RequestBody TaskRequest taskRequest) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized task update attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            TaskResponse response = taskService.updateTask(Long.parseLong(userId), taskId, taskRequest);
            log.info("Task {} updated successfully by user: {}", taskId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Task updated successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (TaskCreationException | CourseDayNotFoundException e) {
            log.error("Validation error updating task: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error updating task: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PatchMapping("/reorder/day/{dayId}")
    @Operation(summary = "Reorder tasks", description = "Allows COUNSELOR or ADMIN to reorder tasks within a course day")
    @ApiResponse(responseCode = "200", description = "Tasks reordered successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<PagedTaskResponse>> reorderTasks(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long dayId,
            @RequestBody TaskOrderRequest orderRequest) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized task reorder attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            PagedTaskResponse response = taskService.reorderTasks(Long.parseLong(userId), dayId, orderRequest);
            log.info("Tasks reordered successfully for dayId: {} by user: {}", dayId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Tasks reordered successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (TaskCreationException | CourseDayNotFoundException e) {
            log.error("Validation error reordering tasks: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error reordering tasks: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }
}