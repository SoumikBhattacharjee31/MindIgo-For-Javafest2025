package com.mindigo.content_service.dto.breathing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CycleResponse {
    private Integer duration;
    private List<BreathingTaskResponse> task;
}
