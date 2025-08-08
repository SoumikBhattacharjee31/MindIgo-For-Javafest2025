package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.*;
import com.mindigo.content_service.services.ContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content")
@Tag(name = "Content Service", description = "Courses and Tasks")
@Slf4j
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/test")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        TestResponse test = TestResponse.builder()
                .api("/api/v1/content/test")
                .status("UP")
                .build();
        return ResponseEntity.ok(ApiResponseClass.<TestResponse>builder()
                .success(true)
//                .data(test)
                .message("Service is healthy")
                .build());
    }

//    @PostMapping("/courses")
//    @Operation(summary = "Create a new course", description = "Allows EXPERT or ADMIN to create a course")
//    @ApiResponse(responseCode = "200", description = "Course created successfully")
//    @ApiResponse(responseCode = "403", description = "Unauthorized access")
//    @ApiResponse(responseCode = "400", description = "Invalid input")
//    public ResponseEntity<ApiResponseClass<CourseResponseDto>> addCourse(
//            @RequestHeader("X-Role") String role,
//            @RequestHeader("X-User-Id") Long userId,
//            @Valid @RequestBody CourseRequestDto request) {
//        CourseResponseDto response = contentService.addCourse(role, userId, request);
//        return ResponseEntity.ok(ApiResponseClass.<CourseResponseDto>builder()
//                .success(true)
//                .data(response)
//                .message("Course created successfully")
//                .build());
//    }
//
//    @DeleteMapping("/courses/{courseId}")
//    @Operation(summary = "Delete a course", description = "Allows EXPERT to delete their own course or ADMIN to delete any course")
//    @ApiResponse(responseCode = "200", description = "Course deleted successfully")
//    @ApiResponse(responseCode = "403", description = "Unauthorized access")
//    @ApiResponse(responseCode = "404", description = "Course not found")
//    public ResponseEntity<ApiResponseClass<String>> removeCourse(
//            @RequestHeader("X-Role") String role,
//            @RequestHeader("X-User-Id") Long userId,
//            @PathVariable Long courseId) {
//        contentService.removeCourse(role, userId, courseId);
//        return ResponseEntity.ok(ApiResponseClass.<String>builder()
//                .success(true)
//                .data(null)
//                .message("Course deleted successfully")
//                .build());
//    }
//
//    @PostMapping("/subscriptions")
//    @Operation(summary = "Subscribe to a package", description = "Allows a user to subscribe to a package")
//    @ApiResponse(responseCode = "200", description = "Subscribed successfully")
//    @ApiResponse(responseCode = "404", description = "Package not found")
//    @ApiResponse(responseCode = "400", description = "Invalid input")
//    public ResponseEntity<ApiResponseClass<SubscriptionResponseDto>> subscribe(
//            @RequestHeader("X-User-Id") Long userId,
//            @Valid @RequestBody SubscriptionRequestDto request) {
//        SubscriptionResponseDto response = contentService.subscribe(userId, request);
//        return ResponseEntity.ok(ApiResponseClass.<SubscriptionResponseDto>builder()
//                .success(true)
//                .data(response)
//                .message("Subscribed successfully")
//                .build());
//    }
//
//    @DeleteMapping("/subscriptions/{subscriptionId}")
//    @Operation(summary = "Unsubscribe from a package", description = "Allows a user to deactivate their subscription")
//    @ApiResponse(responseCode = "200", description = "Unsubscribed successfully")
//    @ApiResponse(responseCode = "404", description = "Subscription not found")
//    @ApiResponse(responseCode = "403", description = "Unauthorized access")
//    public ResponseEntity<ApiResponseClass<String>> unsubscribe(
//            @RequestHeader("X-User-Id") Long userId,
//            @PathVariable Long subscriptionId) {
//        contentService.unsubscribe(userId, subscriptionId);
//        return ResponseEntity.ok(ApiResponseClass.<String>builder()
//                .success(true)
//                .data(null)
//                .message("Unsubscribed successfully")
//                .build());
//    }
}