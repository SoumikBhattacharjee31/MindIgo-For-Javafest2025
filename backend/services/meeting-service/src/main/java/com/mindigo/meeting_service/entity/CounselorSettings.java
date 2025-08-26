package com.mindigo.meeting_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "counselor_settings")
public class CounselorSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "counselor_id", unique = true, nullable = false)
    private Long counselorId;

    @Column(name = "audio_meetings_enabled", nullable = false)
    private Boolean audioMeetingsEnabled = false;

    @Column(name = "video_meetings_enabled", nullable = false)
    private Boolean videoMeetingsEnabled = false;

    public CounselorSettings(Long counselorId, Boolean audioMeetingsEnabled, Boolean videoMeetingsEnabled) {
        this.counselorId = counselorId;
        this.audioMeetingsEnabled = audioMeetingsEnabled;
        this.videoMeetingsEnabled = videoMeetingsEnabled;
    }

}