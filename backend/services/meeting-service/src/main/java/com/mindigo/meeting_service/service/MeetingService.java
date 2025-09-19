package com.mindigo.meeting_service.service;

import com.mindigo.meeting_service.dto.*;
import com.mindigo.meeting_service.entity.*;
import com.mindigo.meeting_service.repository.CounselorSettingsRepository;
import com.mindigo.meeting_service.repository.MeetingRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    @Autowired
    private CounselorSettingsRepository counselorSettingsRepository;

    @Autowired
    private MeetingRequestRepository meetingRequestRepository;

    @Autowired
    private AuthService authService;

    /**
     * Helper method to get or create counselor settings
     */
    private CounselorSettings getOrCreateCounselorSettings(Long counselorId) {
        return counselorSettingsRepository.findByCounselorId(counselorId)
                .orElseGet(() -> {
                    CounselorSettings newSettings = new CounselorSettings(counselorId, true, true);
                    return counselorSettingsRepository.save(newSettings);
                });
    }

    public CounselorSettings updateCounselorSettings(Long counselorId, CounselorSettingsDto dto) {
        CounselorSettings settings = getOrCreateCounselorSettings(counselorId);

        settings.setAudioMeetingsEnabled(dto.getAudioMeetingsEnabled());
        settings.setVideoMeetingsEnabled(dto.getVideoMeetingsEnabled());

        return counselorSettingsRepository.save(settings);
    }

    public CounselorSettings getCounselorSettings(Long counselorId) {
        return getOrCreateCounselorSettings(counselorId);
    }

    public MeetingRequest createMeetingRequest(Long userId, MeetingRequestDto dto) throws Exception {
        // Get or create counselor settings
        CounselorSettings settings = getOrCreateCounselorSettings(dto.getCounselorId());

        // Check if counselor has enabled the requested meeting type
        if (dto.getMeetingType() == MeetingType.AUDIO && !settings.getAudioMeetingsEnabled()) {
            throw new Exception("Counselor has not enabled audio meetings");
        }

        if (dto.getMeetingType() == MeetingType.VIDEO && !settings.getVideoMeetingsEnabled()) {
            throw new Exception("Counselor has not enabled video meetings");
        }

        // Verify counselor exists
        UserProfileResponseFromAuth counselor = authService.getUserById(dto.getCounselorId());
        if (counselor == null || !"COUNSELOR".equals(counselor.getRole())) {
            throw new Exception("Invalid counselor");
        }

        MeetingRequest request = new MeetingRequest(userId, dto.getCounselorId(), dto.getMeetingType());
        return meetingRequestRepository.save(request);
    }

    public MeetingRequest acceptMeetingRequest(Long requestId, Long counselorId) throws Exception {
        Optional<MeetingRequest> optionalRequest = meetingRequestRepository.findById(requestId);
        if (optionalRequest.isEmpty()) {
            throw new Exception("Meeting request not found");
        }

        MeetingRequest request = optionalRequest.get();
        if (!request.getCounselorId().equals(counselorId)) {
            throw new Exception("Unauthorized to accept this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new Exception("Meeting request is not pending");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        request.setMeetingRoomId(UUID.randomUUID().toString());

        return meetingRequestRepository.save(request);
    }

    public MeetingRequest rejectMeetingRequest(Long requestId, Long counselorId, String rejectionReason) throws Exception {
        Optional<MeetingRequest> optionalRequest = meetingRequestRepository.findById(requestId);
        if (optionalRequest.isEmpty()) {
            throw new Exception("Meeting request not found");
        }

        MeetingRequest request = optionalRequest.get();
        if (!request.getCounselorId().equals(counselorId)) {
            throw new Exception("Unauthorized to reject this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new Exception("Meeting request is not pending");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(rejectionReason);

        return meetingRequestRepository.save(request);
    }

    public List<MeetingRequestResponse> getUserMeetingRequests(Long userId) {
        List<MeetingRequest> requests = meetingRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return requests.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<MeetingRequestResponse> getCounselorMeetingRequests(Long counselorId) {
        List<MeetingRequest> requests = meetingRequestRepository.findByCounselorIdOrderByCreatedAtDesc(counselorId);
        return requests.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<MeetingRequestResponse> getCounselorPendingRequests(Long counselorId) {
        List<MeetingRequest> requests = meetingRequestRepository.findByCounselorIdAndStatusOrderByCreatedAtDesc(counselorId, RequestStatus.PENDING);
        return requests.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private MeetingRequestResponse convertToResponse(MeetingRequest request) {
        MeetingRequestResponse response = new MeetingRequestResponse();
        response.setId(request.getId());
        response.setUserId(request.getUserId());
        response.setCounselorId(request.getCounselorId());
        response.setMeetingType(request.getMeetingType());
        response.setStatus(request.getStatus());
        response.setCreatedAt(request.getCreatedAt());
        response.setUpdatedAt(request.getUpdatedAt());
        response.setMeetingRoomId(request.getMeetingRoomId());
        response.setRejectionReason(request.getRejectionReason());

        // Get user and counselor details
        UserProfileResponseFromAuth user = authService.getUserById(request.getUserId());
        if (user != null) {
            response.setUserUsername(user.getName());
        }

        UserProfileResponseFromAuth counselor = authService.getUserById(request.getCounselorId());
        if (counselor != null) {
            response.setCounselorUsername(counselor.getName());
        }

        return response;
    }
}