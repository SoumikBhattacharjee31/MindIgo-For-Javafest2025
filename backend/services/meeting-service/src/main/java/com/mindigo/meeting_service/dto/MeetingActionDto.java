package com.mindigo.meeting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MeetingActionDto {
    private String rejectionReason;

    public MeetingActionDto(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
