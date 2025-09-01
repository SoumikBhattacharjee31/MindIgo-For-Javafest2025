package com.mindigo.content_service.dto.breathing;

import lombok.Data;

import java.util.List;

@Data
public class CustomCycleRequest {
    private Integer duration;
    private List<CustomTaskRequest> task;
}
