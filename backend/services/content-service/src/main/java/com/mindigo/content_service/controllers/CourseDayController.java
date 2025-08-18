package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.*;
import com.mindigo.content_service.exceptions.CourseCreationException;
import com.mindigo.content_service.exceptions.CourseDayCreationException;
import com.mindigo.content_service.exceptions.CourseNotFoundException;
import com.mindigo.content_service.services.CourseDayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content/course-day")
@Tag(name = "Course Day Section on Content Service", description = "Manage course days: create, remove, activate, list, edit, and view details")
@Slf4j
@RequiredArgsConstructor
public class CourseDayController {
    private final CourseDayService courseDayService;

    private boolean isNotAuthorized(String role) {
        return !role.equalsIgnoreCase("COUNSELOR") && !role.equalsIgnoreCase("ADMIN");
    }

    @GetMapping("/{courseDayId}")
    @Operation(summary = "Get course day details", description = "Retrieves details of a specific course day")
    @ApiResponse(responseCode = "200", description = "Course Day details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Course Day not found")
    @ApiResponse(responseCode = "400", description = "Invalid userId")
    public ResponseEntity<ApiResponseClass<CourseDayResponse>> getCourseDayDetails(
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long courseDayId) {
        try {
            CourseDayResponse response = courseDayService.getCourseDayDetails(Long.parseLong(userId),courseDayId);
            log.info("Course day {} details retrieved successfully for user: {}", courseDayId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Course details retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException e) {
            log.error("Course day not found: {}", courseDayId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Error retrieving course details: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/list/{courseId}")
    @Operation(summary = "List course days by Course Id", description = "Lists all course days with pagination using course Id")
    @ApiResponse(responseCode = "200", description = "Courses retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid userId or pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedCourseDayResponse>> listCoursesByPackageId(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @PathVariable Long courseId) {
        try {
            PagedCourseDayResponse courses = courseDayService.listCourseDayByCourseId(Long.parseLong(userId), courseId, page, size);
            log.info("Course days retrieved successfully for courseId: {}", courseId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(courses, "Course days retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (Exception e) {
            log.error("Error listing course days for courseId {}: {}", courseId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @PostMapping("/add")
    @Operation(summary = "Create a new course day", description = "Allows COUNSELOR or ADMIN to create a non-custom course")
    @ApiResponse(responseCode = "201", description = "Course created successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<CourseDayResponse>> addCourse(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @Valid @RequestBody CourseDayRequest request) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized course creation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            CourseDayResponse response = courseDayService.addCourseDay(Long.parseLong(userId),request);
            log.info("Course day '{}' created successfully by user: {}", request.getTitle(), userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseClass.success(response, "Course Day created successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseDayCreationException | CourseNotFoundException e) {
            log.error("Validation error creating course day: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error creating course day: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @DeleteMapping("/{courseDayId}")
    @Operation(summary = "Remove a course day", description = "Allows COUNSELOR or ADMIN to remove a course")
    @ApiResponse(responseCode = "200", description = "Course Day removed successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Course not found")
    public ResponseEntity<ApiResponseClass<Void>> removeCourseDay(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long courseDayId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized course removal attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            courseDayService.removeCourseDay(Long.parseLong(userId), courseDayId);
            log.info("Course day {} removed successfully by user: {}", courseDayId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(null, "Course removed successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseDayCreationException e) {
            log.error("Course Day not found: {}", courseDayId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Unexpected error removing course day: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }
}
