package com.mindigo.routine_service.controller;

import com.mindigo.routine_service.dto.request.AssignRoutineRequest;
import com.mindigo.routine_service.dto.request.CreateRoutineRequest;
import com.mindigo.routine_service.dto.response.RoutineResponse;
import com.mindigo.routine_service.dto.response.TestResponse;
import com.mindigo.routine_service.service.RoutineService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/routines")
@CrossOrigin(origins = "*")
public class RoutineController {

    @Autowired
    private RoutineService routineService;

    @GetMapping("/test")
    public ResponseEntity<TestResponse> testingPath(){
        TestResponse test = TestResponse
                .builder()
                .api("api/v1/routines/test")
                .status("UP").build();
        return ResponseEntity.ok(test);
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> createRoutine(@Valid @RequestBody CreateRoutineRequest request) {
        RoutineResponse response = routineService.createRoutine(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{routineId}")
    public ResponseEntity<RoutineResponse> updateRoutine(
            @PathVariable Long routineId,
            @Valid @RequestBody CreateRoutineRequest request,
            @RequestHeader("X-Doctor-Id") Long doctorId) {
        RoutineResponse response = routineService.updateRoutine(routineId, request, doctorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{routineId}")
    public ResponseEntity<RoutineResponse> getRoutineById(@PathVariable Long routineId) {
        RoutineResponse response = routineService.getRoutineById(routineId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<RoutineResponse>> getRoutinesByDoctor(@PathVariable Long doctorId) {
        List<RoutineResponse> responses = routineService.getRoutinesByDoctor(doctorId);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{routineId}")
    public ResponseEntity<Void> deleteRoutine(
            @PathVariable Long routineId,
            @RequestHeader("X-Doctor-Id") Long doctorId) {
        routineService.deleteRoutine(routineId, doctorId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assign")
    public ResponseEntity<Void> assignRoutineToPatient(@Valid @RequestBody AssignRoutineRequest request) {
        routineService.assignRoutineToPatient(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unassign/patient/{patientId}/routine/{routineId}")
    public ResponseEntity<Void> unassignRoutineFromPatient(
            @PathVariable Long patientId,
            @PathVariable Long routineId) {
        routineService.unassignRoutineFromPatient(patientId, routineId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RoutineResponse>> getPatientRoutines(@PathVariable Long patientId) {
        List<RoutineResponse> responses = routineService.getPatientRoutines(patientId);
        return ResponseEntity.ok(responses);
    }
}
