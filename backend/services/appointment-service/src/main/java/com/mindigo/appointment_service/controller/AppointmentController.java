package com.mindigo.appointment_service.controller;

import com.mindigo.appointment_service.dto.request.*;
import com.mindigo.appointment_service.dto.response.*;
import com.mindigo.appointment_service.service.AppointmentService;
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
@RequestMapping("/api/v1/appointments")
@Tag(name = "Appointments", description = "Appointment management endpoints")
@Slf4j
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Create a new appointment")
    @ApiResponse(responseCode = "201", description = "Appointment created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input or slot not available")
    public ResponseEntity<ApiResponseClass<AppointmentResponse>> createAppointment(
            @RequestBody @Valid CreateAppointmentRequest request,
            HttpServletRequest httpRequest) {

        String role = httpRequest.getHeader("X-User-Role");
        if (!"User".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Only clients can create appointments", "FORBIDDEN"));
        }

        Long clientId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String clientEmail = httpRequest.getHeader("X-User-Email");

        AppointmentResponse appointment = appointmentService.createAppointment(request, clientId, clientEmail);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.success(appointment, "Appointment created successfully"));
    }

    @PutMapping("/status")
    @Operation(summary = "Update appointment status")
    @ApiResponse(responseCode = "200", description = "Appointment status updated successfully")
    public ResponseEntity<ApiResponseClass<AppointmentResponse>> updateAppointmentStatus(
            @RequestBody @Valid UpdateAppointmentStatusRequest request,
            HttpServletRequest httpRequest) {

        Long userId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String role = httpRequest.getHeader("X-User-Role");

        AppointmentResponse appointment = appointmentService.updateAppointmentStatus(request, userId, role);

        return ResponseEntity.ok(ApiResponseClass.success(appointment, "Appointment status updated successfully"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's appointments")
    public ResponseEntity<ApiResponseClass<List<AppointmentResponse>>> getMyAppointments(
            HttpServletRequest httpRequest) {

        Long userId = Long.parseLong(httpRequest.getHeader("X-User-Id"));
        String role = httpRequest.getHeader("X-User-Role");

        System.out.println(role);
        List<AppointmentResponse> appointments;
        if ("User".equals(role)||"User".equals(role)) {
            appointments = appointmentService.getClientAppointments(userId);
        } else if ("COUNSELOR".equals(role)||"Counselor".equals(role)) {
            appointments = appointmentService.getCounselorAppointments(userId);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Invalid role", "FORBIDDEN"));
        }

        return ResponseEntity.ok(ApiResponseClass.success(appointments, "Appointments retrieved successfully"));
    }

    @GetMapping("/available-slots")
    @Operation(summary = "Get available time slots for a counselor on a specific date")
    public ResponseEntity<ApiResponseClass<List<TimeSlotResponse>>> getAvailableSlots(
            @RequestParam Long counselorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<TimeSlotResponse> slots = appointmentService.getAvailableSlots(counselorId, date);

        return ResponseEntity.ok(ApiResponseClass.success(slots, "Available slots retrieved successfully"));
    }

    @GetMapping("/available-dates")
    @Operation(summary = "Get available dates for a counselor")
    public ResponseEntity<ApiResponseClass<List<LocalDate>>> getAvailableDates(
            @RequestParam Long counselorId) {

        List<LocalDate> dates = appointmentService.getAvailableDates(counselorId);

        return ResponseEntity.ok(ApiResponseClass.success(dates, "Available dates retrieved successfully"));
    }
}