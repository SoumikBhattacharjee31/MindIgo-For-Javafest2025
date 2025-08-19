// This will be used in CourseDayResponse to show briefs of Tasks
package com.mindigo.content_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskSummaryResponse {
    private Long id;
    private String title;
    private Boolean available;
    private Boolean completed;
    private Double progress;
}
