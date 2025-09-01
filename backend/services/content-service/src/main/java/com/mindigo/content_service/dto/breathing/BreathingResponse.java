package com.mindigo.content_service.dto.breathing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BreathingResponse {
    private Long id;
    private String title;
    private String description;
    private String pattern;
    private Integer duration;
    private CycleResponse cycle;
}
