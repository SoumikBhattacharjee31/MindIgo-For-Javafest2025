package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.breathing.BreathingResponse;
import com.mindigo.content_service.dto.breathing.BreathingSessionRequest;
import com.mindigo.content_service.dto.breathing.BreathingSessionResponse;
import com.mindigo.content_service.dto.breathing.CustomBreathingRequest;
import com.mindigo.content_service.services.BreathingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;

@RestController
@RequestMapping("/api/v1/content/breathing")
@RequiredArgsConstructor
public class BreathingController {
    private final BreathingService breathingService;

    private final Function<String, Boolean> checkAuthorizedUser = role  -> !role.equalsIgnoreCase("USER");

    @GetMapping
    public ResponseEntity<ApiResponseClass<List<BreathingResponse>>> getBreathingExercises(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role
    ){
        if(checkAuthorizedUser.apply(role))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseClass.error("user not authorized","403"));
        try{
            List<BreathingResponse> response = breathingService.getBreathingOptions(Long.parseLong(userId));
            return ResponseEntity.ok(ApiResponseClass.success(response,"Exercises retrieved successfully"));
        }
        catch (NumberFormatException e){
            return ResponseEntity.badRequest().body(ApiResponseClass.error("Somethings wrong with user Id","400"));
        }
        catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponseClass.error(e.getMessage(),"500"));
        }
    }

    @PutMapping
    public ResponseEntity<ApiResponseClass<BreathingResponse>> customizeBreathingExercise(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody CustomBreathingRequest request
    ){
        if(checkAuthorizedUser.apply(role))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseClass.error("user not authorized","403"));
        try{
            BreathingResponse response = breathingService.customizeBreathingExercise(Long.parseLong(userId),request);
            return ResponseEntity.ok(ApiResponseClass.success(response,"Exercise customized successfully"));
        }catch (NumberFormatException e){
            return ResponseEntity.badRequest().body(ApiResponseClass.error("Somethings wrong with user Id","400"));
        }
        catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponseClass.error(e.getMessage(),"500"));
        }
    }

    @PostMapping("/session")
    public ResponseEntity<ApiResponseClass<BreathingSessionResponse>> storeBreathingSession(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody BreathingSessionRequest request
    ){
        if(checkAuthorizedUser.apply(role))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseClass.error("user not authorized","403"));
        try{
            BreathingSessionResponse response = breathingService.saveBreathingSession(Long.parseLong(userId),request);
            return ResponseEntity.ok(ApiResponseClass.success(response,"Session stored successfully"));
        }catch (NumberFormatException e){
            return ResponseEntity.badRequest().body(ApiResponseClass.error("Somethings wrong with user Id","400"));
        }
        catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponseClass.error(e.getMessage(),"500"));
        }
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponseClass<BreathingSessionResponse>> getLatestSession(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestParam LocalDate date
            ){
        if(checkAuthorizedUser.apply(role))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponseClass.error("user not authorized","403"));
        try{
            BreathingSessionResponse response = breathingService.getLastSession(Long.parseLong(userId),date);
            return ResponseEntity.ok(ApiResponseClass.success(response,"Exercises retrieved successfully"));
        }
        catch (NumberFormatException e){
            return ResponseEntity.badRequest().body(ApiResponseClass.error("Somethings wrong with user Id","400"));
        }
        catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponseClass.error(e.getMessage(),"500"));
        }
    }
}
