package com.mindigo.content_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Boolean active;
    private Boolean enrolled;
    private Double progress;
    private Integer durationDays;
    private Boolean canEdit;
}