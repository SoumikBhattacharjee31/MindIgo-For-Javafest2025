package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.CourseRequest;
import com.mindigo.content_service.dto.PagedCourseResponse;
import com.mindigo.content_service.dto.CourseResponse;
import com.mindigo.content_service.exceptions.CourseCreationException;
import com.mindigo.content_service.exceptions.PackageNotFoundException;
import com.mindigo.content_service.services.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content/course")
@Tag(name = "Course Section on Content Service", description = "Manage courses: create, remove, activate, list, edit, and view details")
@Slf4j
@RequiredArgsConstructor
@Validated
public class CourseController {
    private final CourseService courseService;

    private boolean isNotAuthorized(String role) {
        return !role.equalsIgnoreCase("EXPERT") && !role.equalsIgnoreCase("ADMIN");
    }

    @PostMapping("/add")
    @Operation(summary = "Create a new course", description = "Allows EXPERT or ADMIN to create a non-custom course")
    @ApiResponse(responseCode = "201", description = "Course created successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<CourseResponse>> addCourse(
            @RequestHeader(value = "X-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @Valid @RequestBody CourseRequest request) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized course creation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            CourseResponse response = courseService.addCourse(Long.parseLong(userId), request);
            log.info("Course '{}' created successfully by user: {}", request.getTitle(), userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseClass.success(response, "Course created successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException | PackageNotFoundException e) {
            log.error("Validation error creating course: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error creating course: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PostMapping("/add/custom")
    @Operation(summary = "Create a new custom course", description = "Allows EXPERT or ADMIN to create a custom course with target user email")
    @ApiResponse(responseCode = "201", description = "Custom course created successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<CourseResponse>> addCustomCourse(
            @RequestHeader(value = "X-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @Valid @RequestBody CourseRequest request) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized custom course creation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            CourseResponse response = courseService.addCustomCourse(Long.parseLong(userId), request);
            log.info("Custom course '{}' created successfully by user: {}", request.getTitle(), userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseClass.success(response, "Custom course created successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException | PackageNotFoundException e) {
            log.error("Validation error creating custom course: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error creating custom course: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @DeleteMapping("/{courseId}")
    @Operation(summary = "Remove a course", description = "Allows EXPERT or ADMIN to remove a course")
    @ApiResponse(responseCode = "200", description = "Course removed successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Course not found")
    public ResponseEntity<ApiResponseClass<Void>> removeCourse(
            @RequestHeader(value = "X-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long courseId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized course removal attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            courseService.removeCourse(Long.parseLong(userId), courseId);
            log.info("Course {} removed successfully by user: {}", courseId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(null, "Course removed successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException e) {
            log.error("Course not found: {}", courseId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Unexpected error removing course: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PatchMapping("/{courseId}/activate")
    @Operation(summary = "Activate a course", description = "Allows EXPERT or ADMIN to activate a course if it has at least one course day")
    @ApiResponse(responseCode = "200", description = "Course activated successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Course not found")
    @ApiResponse(responseCode = "400", description = "No course days in course")
    public ResponseEntity<ApiResponseClass<CourseResponse>> activateCourse(
            @RequestHeader(value = "X-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long courseId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized course activation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            CourseResponse response = courseService.activateCourse(Long.parseLong(userId), courseId);
            log.info("Course {} activated successfully by user: {}", courseId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Course activated successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException e) {
            log.error("Error activating course {}: {}", courseId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error activating course: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @GetMapping("/list/my")
    @Operation(summary = "List my courses", description = "Lists all courses owned by the user with pagination using userId")
    @ApiResponse(responseCode = "200", description = "Courses retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid userId or pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedCourseResponse>> listMyCourses(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        try {
            PagedCourseResponse courses = courseService.listCoursesByUserId(Long.parseLong(userId), page, size);
            log.info("Courses retrieved successfully for userId: {}", userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(courses, "Courses retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (Exception e) {
            log.error("Error listing courses for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/list/email")
    @Operation(summary = "List courses by email", description = "Lists all courses owned by the user with pagination using email")
    @ApiResponse(responseCode = "200", description = "Courses retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid email or pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedCourseResponse>> listCoursesByEmail(
            @RequestParam @Email String email,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        try {
            PagedCourseResponse courses = courseService.listCoursesByEmail(email, page, size);
            log.info("Courses retrieved successfully for email: {}", email);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(courses, "Courses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error listing courses for email {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/list/active")
    @Operation(summary = "List active courses", description = "Lists all activated courses with pagination")
    @ApiResponse(responseCode = "200", description = "Active courses retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedCourseResponse>> listActiveCourses(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        try {
            PagedCourseResponse courses = courseService.listActiveCourses(page, size);
            log.info("Active courses retrieved successfully, page: {}, size: {}", page, size);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(courses, "Active courses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error listing active courses: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/{courseId}")
    @Operation(summary = "Get course details", description = "Retrieves details of a specific course")
    @ApiResponse(responseCode = "200", description = "Course details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Course not found")
    @ApiResponse(responseCode = "400", description = "Invalid userId")
    public ResponseEntity<ApiResponseClass<CourseResponse>> getCourseDetails(
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long courseId) {
        try {
            CourseResponse response = courseService.getCourseDetails(courseId, Long.parseLong(userId));
            log.info("Course {} details retrieved successfully for user: {}", courseId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Course details retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException e) {
            log.error("Course not found: {}", courseId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Error retrieving course details: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @PutMapping("/replace/{courseId}")
    @Operation(summary = "Replace a course", description = "Allows EXPERT or ADMIN to fully replace a course")
    @ApiResponse(responseCode = "200", description = "Course replaced successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Course or package not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<CourseResponse>> replaceCourse(
            @RequestHeader(value = "X-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long courseId,
            @Valid @RequestBody CourseRequest courseRequest) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized course replacement attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            CourseResponse response = courseService.replaceCourse(Long.parseLong(userId), courseId, courseRequest);
            log.info("Course {} replaced successfully by user: {}", courseId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Course replaced successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException | PackageNotFoundException e) {
            log.error("Validation error replacing course: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error replacing course: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PatchMapping("/{courseId}")
    @Operation(summary = "Partially update a course", description = "Allows EXPERT or ADMIN to partially update a course")
    @ApiResponse(responseCode = "200", description = "Course updated successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Course or package not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<CourseResponse>> updateCourse(
            @RequestHeader(value = "X-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long courseId,
            @RequestBody CourseRequest courseRequest) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized course update attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            CourseResponse response = courseService.updateCourse(Long.parseLong(userId), courseId, courseRequest);
            log.info("Course {} updated successfully by user: {}", courseId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Course updated successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (CourseCreationException | PackageNotFoundException e) {
            log.error("Validation error updating course: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error updating course: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }
}