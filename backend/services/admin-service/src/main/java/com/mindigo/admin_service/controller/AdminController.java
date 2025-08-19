package com.mindigo.admin_service.controller;

import com.mindigo.admin_service.dto.request.ApplicationReviewRequest;
import com.mindigo.admin_service.dto.request.CounselorApplicationCreateRequest;
import com.mindigo.admin_service.dto.request.CounselorApplicationStatusUpdateRequest;
import com.mindigo.admin_service.dto.response.AdminDashboardResponse;
import com.mindigo.admin_service.dto.response.ApiResponseClass;
import com.mindigo.admin_service.dto.response.CounselorApplicationDto;
import com.mindigo.admin_service.entity.CounselorApplicationStatus;
import com.mindigo.admin_service.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin", description = "Admin management endpoints")
@Slf4j
//@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    @ApiResponse(responseCode = "200", description = "Dashboard data retrieved successfully")
    public ResponseEntity<ApiResponseClass<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse dashboard = adminService.getDashboardStats();

        return ResponseEntity.ok(ApiResponseClass.<AdminDashboardResponse>builder()
                .success(true)
                .data(dashboard)
                .message("Dashboard data retrieved successfully")
                .build());
    }

    @GetMapping("/applications")
    @Operation(summary = "Get all counselor applications with pagination")
    public ResponseEntity<ApiResponseClass<Page<CounselorApplicationDto>>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CounselorApplicationDto> applications = adminService.getAllApplications(pageable);

        return ResponseEntity.ok(ApiResponseClass.<Page<CounselorApplicationDto>>builder()
                .success(true)
                .data(applications)
                .message("Applications retrieved successfully")
                .build());
    }

    @GetMapping("/applications/status/{status}")
    @Operation(summary = "Get counselor applications by status")
    public ResponseEntity<ApiResponseClass<Page<CounselorApplicationDto>>> getApplicationsByStatus(
            @PathVariable CounselorApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CounselorApplicationDto> applications = adminService.getApplicationsByStatus(status, pageable);

        return ResponseEntity.ok(ApiResponseClass.<Page<CounselorApplicationDto>>builder()
                .success(true)
                .data(applications)
                .message("Applications retrieved successfully")
                .build());
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Get counselor application by ID")
    public ResponseEntity<ApiResponseClass<CounselorApplicationDto>> getApplicationById(@PathVariable Long id) {
        CounselorApplicationDto application = adminService.getApplicationById(id);

        return ResponseEntity.ok(ApiResponseClass.<CounselorApplicationDto>builder()
                .success(true)
                .data(application)
                .message("Application retrieved successfully")
                .build());
    }

    @PostMapping("/applications/review")
    @Operation(summary = "Review counselor application (approve/reject/request info)")
    @ApiResponse(responseCode = "200", description = "Application reviewed successfully")
    public ResponseEntity<ApiResponseClass<Void>> reviewApplication(
            @Valid @RequestBody ApplicationReviewRequest request,
            HttpServletRequest httpRequest) {

        // TODO: Get admin email from JWT token
        String adminEmail = "admin@example.com"; // This should come from security context

        String result = adminService.reviewApplication(request, adminEmail, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message(result)
                .build());
    }

    // Add these methods to your existing AdminController class

    @PostMapping("/counselor-applications/create")
    @Operation(summary = "Create counselor application from auth service")
    @ApiResponse(responseCode = "201", description = "Application created successfully")
    public ResponseEntity<ApiResponseClass<String>> createCounselorApplication(
            @Valid @RequestBody CounselorApplicationCreateRequest request) {

        Long applicationId = adminService.createCounselorApplication(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.<String>builder()
                        .success(true)
                        .data("Application created with ID: " + applicationId)
                        .message("Counselor application created successfully")
                        .build());
    }

    @PostMapping("/counselor-applications/update-status")
    @Operation(summary = "Update counselor application status from auth service")
    @ApiResponse(responseCode = "200", description = "Status updated successfully")
    public ResponseEntity<ApiResponseClass<String>> updateCounselorApplicationStatus(
            @Valid @RequestBody CounselorApplicationStatusUpdateRequest request) {

        adminService.updateCounselorApplicationStatus(request);

        return ResponseEntity.ok(ApiResponseClass.<String>builder()
                .success(true)
                .message("Counselor application status updated successfully")
                .build());
    }
}