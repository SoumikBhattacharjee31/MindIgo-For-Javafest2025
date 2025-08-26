package com.mindigo.meeting_service.dto;

import com.mindigo.meeting_service.entity.MeetingType;
import com.mindigo.meeting_service.entity.RequestStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class MeetingRequestResponse {
    private Long id;
    private Long userId;
    private Long counselorId;
    private String userUsername;
    private String counselorUsername;
    private MeetingType meetingType;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String meetingRoomId;
    private String rejectionReason;
}
