package com.mindigo.content_service.dto.breathing;

import lombok.Data;

@Data
public class CustomTaskRequest {
    private Integer order;
    private String type;
    private Integer duration;
}
