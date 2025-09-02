package com.mindigo.appointment_service.controller;

import com.mindigo.appointment_service.dto.request.CounselorSettingsRequest;
import com.mindigo.appointment_service.dto.response.*;
import com.mindigo.appointment_service.service.CounselorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/appointments/counselors")
@Tag(name = "Counselors", description = "Counselor management endpoints")
@Slf4j
public class CounselorController {

    private final CounselorService counselorService;

    @GetMapping
    @Operation(summary = "Get list of approved counselors")
    public ResponseEntity<ApiResponseClass<List<CounselorResponse>>> getApprovedCounselors() {
        List<CounselorResponse> counselors = counselorService.getApprovedCounselors();
        return ResponseEntity.ok(ApiResponseClass.success(counselors, "Approved counselors retrieved successfully"));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get counselor settings")
    public ResponseEntity<ApiResponseClass<CounselorSettingsResponse>> getSettings(
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can view settings", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        CounselorSettingsResponse settings = counselorService.getSettings(counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(settings, "Settings retrieved successfully"));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update counselor settings")
    public ResponseEntity<ApiResponseClass<CounselorSettingsResponse>> updateSettings(
            @RequestBody @Valid CounselorSettingsRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"Counselor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only counselors can update settings", "FORBIDDEN"));
        }

        Long counselorId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String counselorEmail = httpRequest.getHeader("X-User-Email");

        CounselorSettingsResponse settings = counselorService.updateSettings(request, counselorId, counselorEmail);

        return ResponseEntity.ok(ApiResponseClass.success(settings, "Settings updated successfully"));
    }
}