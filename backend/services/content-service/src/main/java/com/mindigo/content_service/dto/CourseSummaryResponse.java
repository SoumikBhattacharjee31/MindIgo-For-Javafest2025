// this will be used for only
package com.mindigo.content_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseSummaryResponse {
    private Long id;
    private String title;
    private Boolean active;
}
