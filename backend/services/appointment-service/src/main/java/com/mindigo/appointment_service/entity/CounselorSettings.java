package com.mindigo.appointment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "counselor_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long counselorId;

    @Column(nullable = false)
    private String counselorEmail;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxBookingDays = 10; // Default 10 days, max 30

    @Column(nullable = false)
    @Builder.Default
    private Integer defaultSlotDurationMinutes = 60;

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoAcceptAppointments = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
