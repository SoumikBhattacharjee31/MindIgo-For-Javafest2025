package com.mindigo.auth_service.controller;

import com.mindigo.auth_service.dto.response.ApiResponseClass;
import com.mindigo.auth_service.dto.response.CounselorProfileResponse;
import com.mindigo.auth_service.services.CounselorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth/counselor")
@Tag(name = "Counselors", description = "Endpoints for retrieving counselor profiles")
public class CounselorController {

    private final CounselorService counselorService;

    @GetMapping
    @Operation(summary = "Get counselors with pagination, search, filtering, and sorting")
    public ResponseEntity<ApiResponseClass<Page<CounselorProfileResponse>>> getAllCounselors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Search term for counselor name or specialization")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filter by whether the counselor accepts insurance")
            @RequestParam(required = false) Boolean acceptsInsurance,
            @Parameter(description = "Filter by a specific specialization (case-insensitive, exact match)")
            @RequestParam(required = false) String specialization, // Add this parameter
            @Parameter(description = "Sort criteria in the format: field,direction (e.g., averageRating,desc)")
            @RequestParam(defaultValue = "averageRating,desc") String[] sort) {

        Page<CounselorProfileResponse> counselors = counselorService.getAllApprovedCounselors(
                page, size, search, acceptsInsurance, specialization, sort // Pass it to the service
        );

        return ResponseEntity.ok(ApiResponseClass.<Page<CounselorProfileResponse>>builder()
                .success(true)
                .data(counselors)
                .message("Counselors retrieved successfully.")
                .build());
    }
}