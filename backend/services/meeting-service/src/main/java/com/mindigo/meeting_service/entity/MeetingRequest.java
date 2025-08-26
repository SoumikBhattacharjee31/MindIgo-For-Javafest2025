package com.mindigo.meeting_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "meeting_requests")
public class MeetingRequest {
    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "counselor_id", nullable = false)
    private Long counselorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", nullable = false)
    private MeetingType meetingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "meeting_room_id")
    private String meetingRoomId;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    // Constructors
    public MeetingRequest() {
        this.createdAt = LocalDateTime.now();
    }

    public MeetingRequest(Long userId, Long counselorId, MeetingType meetingType) {
        this.userId = userId;
        this.counselorId = counselorId;
        this.meetingType = meetingType;
        this.createdAt = LocalDateTime.now();
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
}
