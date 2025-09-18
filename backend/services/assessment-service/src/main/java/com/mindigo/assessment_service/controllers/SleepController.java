package com.mindigo.assessment_service.controllers;

import com.mindigo.assessment_service.dto.ApiResponseClass;
import com.mindigo.assessment_service.dto.sleep.SleepRequest;
import com.mindigo.assessment_service.dto.sleep.SleepResponse;
import com.mindigo.assessment_service.services.SleepService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/assessment/sleep")
@RequiredArgsConstructor
public class SleepController {

    private final SleepService sleepService;

    @PostMapping
    public ResponseEntity<ApiResponseClass<SleepResponse>> saveOrUpdate(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody SleepRequest request
    ) {
        request.setUserId(userId);
        SleepResponse response = sleepService.saveOrUpdate(request);
        return ResponseEntity.ok(ApiResponseClass.success(response, "Sleep data saved/updated successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponseClass<List<SleepResponse>>> getAllByUser(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role
    ) {
        List<SleepResponse> response = sleepService.getAllByUserId(userId);
        return ResponseEntity.ok(ApiResponseClass.success(response, "Fetched all sleep records"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponseClass<Void>> deleteByDate(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        sleepService.deleteByUserIdAndDate(userId, date);
        return ResponseEntity.ok(ApiResponseClass.success(null, "Sleep data deleted successfully"));
    }

    @GetMapping("/last")
    public ResponseEntity<ApiResponseClass<List<SleepResponse>>> getLastNDays(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate today,
            @RequestParam int days
    ) {
        List<SleepResponse> response = sleepService.getLastNDays(userId, today, days);
        return ResponseEntity.ok(ApiResponseClass.success(response, "Fetched last " + days + " days of data"));
    }
}
