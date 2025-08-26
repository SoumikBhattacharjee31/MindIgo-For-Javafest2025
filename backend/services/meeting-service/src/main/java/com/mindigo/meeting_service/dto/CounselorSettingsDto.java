package com.mindigo.meeting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CounselorSettingsDto {
    private Boolean audioMeetingsEnabled;
    private Boolean videoMeetingsEnabled;

    public CounselorSettingsDto(Boolean audioMeetingsEnabled, Boolean videoMeetingsEnabled) {
        this.audioMeetingsEnabled = audioMeetingsEnabled;
        this.videoMeetingsEnabled = videoMeetingsEnabled;
    }
}
