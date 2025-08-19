package com.mindigo.content_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDayResponse {
    private Long id;
    private String title;
    private String description;
    private List<TaskSummaryResponse> taskList = new ArrayList<>();
    private Integer dayNumber;
    private Boolean canEdit;
}
