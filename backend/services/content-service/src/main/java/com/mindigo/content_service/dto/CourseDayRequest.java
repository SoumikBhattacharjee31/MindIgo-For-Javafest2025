package com.mindigo.content_service.dto;
import lombok.Data;

@Data
public class CourseDayRequest {
    private String title;
    private String description;
    private Long courseId;
}
