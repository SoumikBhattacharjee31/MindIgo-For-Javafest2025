package com.mindigo.content_service.dto.breathing;

import lombok.Data;

@Data
public class CustomBreathingRequest {
    private Long id;
    private CustomCycleRequest cycle;
}
