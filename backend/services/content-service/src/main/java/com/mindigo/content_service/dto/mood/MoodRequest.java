package com.mindigo.content_service.dto.mood;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MoodRequest {
    private String mood;
    private LocalDate date;
    private String description;
    private String reason;
}
