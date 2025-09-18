package com.mindigo.content_service.models.sleep;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "sleep_data")
public class SleepData {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "sleep_time", nullable = false)
    private LocalTime sleepTime;   // e.g. 11:30 PM

    @Column(name = "wake_time", nullable = false)
    private LocalTime wakeTime;    // e.g. 7:00 AM
}
