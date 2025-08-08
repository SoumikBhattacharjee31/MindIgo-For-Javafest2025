package com.mindigo.routine_service.entity;

import com.mindigo.routine_service.enums.ActivityType;
import com.mindigo.routine_service.enums.DayOfWeek;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "routine_activities")
@Data
@NoArgsConstructor
public class RoutineActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Routine is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @NotBlank(message = "Activity name is required")
    @Column(name = "activity_name", nullable = false)
    private String activityName;

    @NotNull(message = "Activity type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "description")
    private String description;

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private DayOfWeek dayOfWeek;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "is_active")
    private Boolean isActive = true;

    public RoutineActivity(Routine routine, String activityName, ActivityType activityType,
                           LocalTime startTime, LocalTime endTime) {
        this.routine = routine;
        this.activityName = activityName;
        this.activityType = activityType;
        this.startTime = startTime;
        this.endTime = endTime;
    }

}
