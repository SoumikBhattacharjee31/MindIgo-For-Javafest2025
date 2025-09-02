package com.mindigo.appointment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "date_specific_availability")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DateSpecificAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long counselorId;

    @Column(nullable = false)
    private String counselorEmail;

    @Column(nullable = false)
    private LocalDate specificDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailabilityType type; // AVAILABLE or UNAVAILABLE

    @Column(nullable = false)
    @Builder.Default
    private Integer slotDurationMinutes = 60;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private String reason; // Optional reason for the exception

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Table(uniqueConstraints = {
            @UniqueConstraint(columnNames = {"counselorId", "specificDate", "startTime", "endTime"})
    })
    public static class Constraints {}
}