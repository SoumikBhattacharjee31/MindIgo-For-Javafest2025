package com.mindigo.content_service.dto.breathing;

import lombok.Data;

import java.util.List;

@Data
public class CustomCycleRequest {
    private List<CustomTaskRequest> task;
}
