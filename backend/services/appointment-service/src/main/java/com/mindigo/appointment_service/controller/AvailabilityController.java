package com.mindigo.appointment_service.controller;

import com.mindigo.appointment_service.dto.request.*;
import com.mindigo.appointment_service.dto.response.*;
import com.mindigo.appointment_service.service.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/appointments/availability")
@Tag(name = "Availability", description = "Counselor availability management")
@Slf4j
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @PostMapping
    @Operation(summary = "Create counselor availability")
    @ApiResponse(responseCode = "201", description = "Availability created successfully")
    public ResponseEntity<ApiResponseClass<AvailabilityResponse>> createAvailability(
            @RequestBody @Valid AvailabilityRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can manage availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String counselorEmail = httpRequest.getHeader("X-User-Email");

        AvailabilityResponse availability = availabilityService.createAvailability(request, counselorId, counselorEmail);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.success(availability, "Availability created successfully"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get counselor's availability")
    public ResponseEntity<ApiResponseClass<List<AvailabilityResponse>>> getMyAvailability(
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can view availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        List<AvailabilityResponse> availability = availabilityService.getCounselorAvailability(counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(availability, "Availability retrieved successfully"));
    }

    @GetMapping("/counselor/{counselorId}")
    @Operation(summary = "Get specific counselor's availability (public)")
    public ResponseEntity<ApiResponseClass<List<AvailabilityResponse>>> getCounselorAvailability(
            @PathVariable Long counselorId) {

        List<AvailabilityResponse> availability = availabilityService.getCounselorAvailability(counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(availability, "Availability retrieved successfully"));
    }

    @PutMapping("/{availabilityId}")
    @Operation(summary = "Update counselor availability")
    public ResponseEntity<ApiResponseClass<AvailabilityResponse>> updateAvailability(
            @PathVariable Long availabilityId,
            @RequestBody @Valid AvailabilityRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can update availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        AvailabilityResponse availability = availabilityService.updateAvailability(availabilityId, request, counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(availability, "Availability updated successfully"));
    }

    @DeleteMapping("/{availabilityId}")
    @Operation(summary = "Delete counselor availability")
    public ResponseEntity<ApiResponseClass<Void>> deleteAvailability(
            @PathVariable Long availabilityId,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can delete availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        availabilityService.deleteAvailability(availabilityId, counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(null, "Availability deleted successfully"));
    }

    // Date-specific availability endpoints
    @PostMapping("/date-specific")
    @Operation(summary = "Create date-specific availability exception")
    @ApiResponse(responseCode = "201", description = "Date-specific availability created successfully")
    public ResponseEntity<ApiResponseClass<DateSpecificAvailabilityResponse>> createDateSpecificAvailability(
            @RequestBody @Valid DateSpecificAvailabilityRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can manage availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String counselorEmail = httpRequest.getHeader("X-User-Email");

        DateSpecificAvailabilityResponse availability = availabilityService
                .createDateSpecificAvailability(request, counselorId, counselorEmail);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.success(availability, "Date-specific availability created successfully"));
    }

    @GetMapping("/date-specific/my")
    @Operation(summary = "Get counselor's date-specific availability exceptions")
    public ResponseEntity<ApiResponseClass<List<DateSpecificAvailabilityResponse>>> getMyDateSpecificAvailability(
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can view availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        List<DateSpecificAvailabilityResponse> availability = availabilityService
                .getDateSpecificAvailability(counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(availability, "Date-specific availability retrieved successfully"));
    }

    @GetMapping("/date-specific/counselor/{counselorId}")
    @Operation(summary = "Get specific counselor's date-specific availability (public)")
    public ResponseEntity<ApiResponseClass<List<DateSpecificAvailabilityResponse>>> getCounselorDateSpecificAvailability(
            @PathVariable Long counselorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<DateSpecificAvailabilityResponse> availability;
        if (date != null) {
            availability = availabilityService.getDateSpecificAvailabilityForDate(counselorId, date);
        } else {
            availability = availabilityService.getDateSpecificAvailability(counselorId);
        }

        return ResponseEntity.ok(ApiResponseClass.success(availability, "Date-specific availability retrieved successfully"));
    }

    @PutMapping("/date-specific/{availabilityId}")
    @Operation(summary = "Update date-specific availability exception")
    public ResponseEntity<ApiResponseClass<DateSpecificAvailabilityResponse>> updateDateSpecificAvailability(
            @PathVariable Long availabilityId,
            @RequestBody @Valid DateSpecificAvailabilityRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can update availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        DateSpecificAvailabilityResponse availability = availabilityService
                .updateDateSpecificAvailability(availabilityId, request, counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(availability, "Date-specific availability updated successfully"));
    }

    @DeleteMapping("/date-specific/{availabilityId}")
    @Operation(summary = "Delete date-specific availability exception")
    public ResponseEntity<ApiResponseClass<Void>> deleteDateSpecificAvailability(
            @PathVariable Long availabilityId,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can delete availability", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        availabilityService.deleteDateSpecificAvailability(availabilityId, counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(null, "Date-specific availability deleted successfully"));
    }
}