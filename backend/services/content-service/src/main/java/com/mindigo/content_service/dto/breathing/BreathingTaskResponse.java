package com.mindigo.content_service.dto.breathing;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BreathingTaskResponse {
    private Integer order;
    private String type;
    private Integer duration;
}
