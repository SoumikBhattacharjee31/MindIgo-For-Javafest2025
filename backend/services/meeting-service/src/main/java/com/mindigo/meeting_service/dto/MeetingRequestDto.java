package com.mindigo.meeting_service.dto;

import com.mindigo.meeting_service.entity.MeetingType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MeetingRequestDto {
    @NotNull(message = "Counselor ID is required")
    private Long counselorId;

    @NotNull(message = "Meeting type is required")
    private MeetingType meetingType;

    public MeetingRequestDto(Long counselorId, MeetingType meetingType) {
        this.counselorId = counselorId;
        this.meetingType = meetingType;
    }
}
