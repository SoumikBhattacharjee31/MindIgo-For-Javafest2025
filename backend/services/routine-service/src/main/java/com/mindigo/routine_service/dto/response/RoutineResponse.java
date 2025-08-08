package com.mindigo.routine_service.dto.response;

import com.mindigo.routine_service.enums.RoutineType;

import java.time.LocalDateTime;
import java.util.List;

public class RoutineResponse {
    private Long id;
    private String name;
    private String description;
    private Long doctorId;
    private RoutineType routineType;
    private Boolean isActive;
    private List<ActivityResponse> activities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public RoutineResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public RoutineType getRoutineType() { return routineType; }
    public void setRoutineType(RoutineType routineType) { this.routineType = routineType; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public List<ActivityResponse> getActivities() { return activities; }
    public void setActivities(List<ActivityResponse> activities) { this.activities = activities; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
