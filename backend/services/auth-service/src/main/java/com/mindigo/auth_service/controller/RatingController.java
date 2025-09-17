package com.mindigo.auth_service.controller;

import com.mindigo.auth_service.dto.request.RateCounselorRequest;
import com.mindigo.auth_service.dto.response.ApiResponseClass;
import com.mindigo.auth_service.dto.response.CounselorRatingResponse;
import com.mindigo.auth_service.services.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth/ratings")
@Tag(name = "Rating System", description = "Endpoints for rating counselors")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/counselor")
    @Operation(summary = "Allows a logged-in user to rate a counselor")
    public ResponseEntity<ApiResponseClass<Void>> rateCounselor(
            @RequestBody @Valid RateCounselorRequest request,
            HttpServletRequest httpRequest) {

        ratingService.rateCounselor(request, httpRequest);
        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Counselor rated successfully.")
                .build());
    }

    @GetMapping("/counselor/{counselorId}")
    @Operation(summary = "Get all ratings for a specific counselor with pagination")
    public ResponseEntity<ApiResponseClass<Page<CounselorRatingResponse>>> getRatingsForCounselor(
            @PathVariable Long counselorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<CounselorRatingResponse> ratingsPage = ratingService.getRatingsForCounselor(counselorId, page, size);

        return ResponseEntity.ok(ApiResponseClass.<Page<CounselorRatingResponse>>builder()
                .success(true)
                .data(ratingsPage)
                .message("Ratings retrieved successfully.")
                .build());
    }
}