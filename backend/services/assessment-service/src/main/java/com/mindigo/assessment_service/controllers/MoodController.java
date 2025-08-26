package com.mindigo.assessment_service.controllers;

import com.mindigo.assessment_service.dto.ApiResponseClass;
import com.mindigo.assessment_service.dto.mood.MoodRequest;
import com.mindigo.assessment_service.dto.mood.MoodResponse;
import com.mindigo.assessment_service.services.MoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;

import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.Min;

@Validated
@RestController
@RequestMapping("/api/v1/assessment/mood")
@RequiredArgsConstructor
public class MoodController {
    private final MoodService moodService;

    private boolean isNotAuthorized(String role) {
        return !role.equalsIgnoreCase("USER");
    }

    public ApiResponseClass<MoodResponse> setMode(){
        return null;
    }

    @GetMapping("/get-mood")
    @Operation(summary = "Get moods of an user of last 7 days")
    public ResponseEntity<ApiResponseClass<List<MoodResponse>>> getAllMoods(
            @RequestParam(name = "days", defaultValue = "7") @Min(0) int days,
            @RequestParam(name = "today") LocalDate today,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole
    ){
        if(isNotAuthorized(userRole)){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseClass.error("Unauthorized access","403"));
        }
        try{
            List<MoodResponse> response = moodService.getMoods(Long.parseLong(userId),days,today);
            return ResponseEntity.ok(ApiResponseClass.success(response,"Successfully Retrieved"));
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(ApiResponseClass.error(e.getMessage(),"400"));
        }
        catch (Exception e){
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error(e.getMessage(),"500"));
        }
    }

    @PostMapping("/set-mood")
    @Operation(summary = "Set mood of a date")
    public ResponseEntity<ApiResponseClass<MoodResponse>> setMood(
            @RequestBody MoodRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole
    ){
        if(isNotAuthorized(userRole)){
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseClass.error("Unauthorized access","403"));
        }
        try{
            MoodResponse response = moodService.setMoods(Long.parseLong(userId),request);
            return ResponseEntity.ok(ApiResponseClass.success(response,"mood successfully set"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponseClass.error(e.getMessage(),"400"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponseClass.error(e.getMessage(),"500"));
        }
    }

}
