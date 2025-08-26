package com.mindigo.meeting_service.controller;

import com.mindigo.meeting_service.dto.*;
import com.mindigo.meeting_service.entity.CounselorSettings;
import com.mindigo.meeting_service.entity.MeetingRequest;
import com.mindigo.meeting_service.service.MeetingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/meeting")
//@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    // Counselor endpoints
    @GetMapping("/counselor/settings")
    public ResponseEntity<CounselorSettings> getCounselorSettings(HttpServletRequest request) {
        Long counselorId = Long.valueOf(request.getHeader("X-User-Id"));
        CounselorSettings settings = meetingService.getCounselorSettings(counselorId);
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/counselor/settings")
    public ResponseEntity<CounselorSettings> updateCounselorSettings(
            @Valid @RequestBody CounselorSettingsDto dto,
            HttpServletRequest request) {
        Long counselorId = Long.valueOf(request.getHeader("X-User-Id"));
        CounselorSettings settings = meetingService.updateCounselorSettings(counselorId, dto);
        return ResponseEntity.ok(settings);
    }

    @GetMapping("/counselor/requests")
    public ResponseEntity<List<MeetingRequestResponse>> getCounselorMeetingRequests(HttpServletRequest request) {
        Long counselorId = Long.valueOf(request.getHeader("X-User-Id"));
        List<MeetingRequestResponse> requests = meetingService.getCounselorMeetingRequests(counselorId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/counselor/requests/pending")
    public ResponseEntity<List<MeetingRequestResponse>> getCounselorPendingRequests(HttpServletRequest request) {
        Long counselorId = Long.valueOf(request.getHeader("X-User-Id"));
        List<MeetingRequestResponse> requests = meetingService.getCounselorPendingRequests(counselorId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/counselor/requests/{requestId}/accept")
    public ResponseEntity<?> acceptMeetingRequest(@PathVariable Long requestId, HttpServletRequest request) {
        try {
            Long counselorId = Long.valueOf(request.getHeader("X-User-Id"));
            MeetingRequest meetingRequest = meetingService.acceptMeetingRequest(requestId, counselorId);
            return ResponseEntity.ok(meetingRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/counselor/requests/{requestId}/reject")
    public ResponseEntity<?> rejectMeetingRequest(
            @PathVariable Long requestId,
            @RequestBody MeetingActionDto dto,
            HttpServletRequest request) {
        try {
            Long counselorId = Long.valueOf(request.getHeader("X-User-Id"));
            MeetingRequest meetingRequest = meetingService.rejectMeetingRequest(requestId, counselorId, dto.getRejectionReason());
            return ResponseEntity.ok(meetingRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // User endpoints
    @PostMapping("/user/request")
    public ResponseEntity<?> createMeetingRequest(
            @Valid @RequestBody MeetingRequestDto dto,
            HttpServletRequest request) {
        try {
            System.out.println("+++++++++++++++++++++++++++++++++++++++++++++++");
            Long userId = Long.valueOf(request.getHeader("X-User-Id"));
            System.out.println(userId);
            MeetingRequest meetingRequest = meetingService.createMeetingRequest(userId, dto);
            return ResponseEntity.ok(meetingRequest);
        } catch (Exception e) {
            System.out.println("-------------------------------------------------");
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/requests")
    public ResponseEntity<List<MeetingRequestResponse>> getUserMeetingRequests(HttpServletRequest request) {
        Long userId = Long.valueOf(request.getHeader("X-User-Id"));
        List<MeetingRequestResponse> requests = meetingService.getUserMeetingRequests(userId);
        return ResponseEntity.ok(requests);
    }
}
