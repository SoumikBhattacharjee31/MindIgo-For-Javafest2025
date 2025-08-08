package com.mindigo.admin_service.controller;

import com.mindigo.admin_service.dto.request.ApplicationReviewRequest;
import com.mindigo.admin_service.dto.response.AdminDashboardResponse;
import com.mindigo.admin_service.dto.response.ApiResponseClass;
import com.mindigo.admin_service.dto.response.DoctorApplicationDto;
import com.mindigo.admin_service.entity.DoctorApplicationStatus;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @Operation(summary = "Get all doctor applications with pagination")
    public ResponseEntity<ApiResponseClass<Page<DoctorApplicationDto>>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<DoctorApplicationDto> applications = adminService.getAllApplications(pageable);

        return ResponseEntity.ok(ApiResponseClass.<Page<DoctorApplicationDto>>builder()
                .success(true)
                .data(applications)
                .message("Applications retrieved successfully")
                .build());
    }

    @GetMapping("/applications/status/{status}")
    @Operation(summary = "Get doctor applications by status")
    public ResponseEntity<ApiResponseClass<Page<DoctorApplicationDto>>> getApplicationsByStatus(
            @PathVariable DoctorApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DoctorApplicationDto> applications = adminService.getApplicationsByStatus(status, pageable);

        return ResponseEntity.ok(ApiResponseClass.<Page<DoctorApplicationDto>>builder()
                .success(true)
                .data(applications)
                .message("Applications retrieved successfully")
                .build());
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Get doctor application by ID")
    public ResponseEntity<ApiResponseClass<DoctorApplicationDto>> getApplicationById(@PathVariable Long id) {
        DoctorApplicationDto application = adminService.getApplicationById(id);

        return ResponseEntity.ok(ApiResponseClass.<DoctorApplicationDto>builder()
                .success(true)
                .data(application)
                .message("Application retrieved successfully")
                .build());
    }

    @PostMapping("/applications/review")
    @Operation(summary = "Review doctor application (approve/reject/request info)")
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
}