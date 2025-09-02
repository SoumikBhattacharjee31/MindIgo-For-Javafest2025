package com.mindigo.content_service.dto.breathing;

import lombok.Data;

@Data
public class CustomBreathingRequest {
    private Long id;
    private Integer duration; // in minutes
    private CustomCycleRequest cycle;
}
