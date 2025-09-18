package com.mindigo.content_service.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDto {
    private String question;
    private String type;
    private List<String> options;
    private Integer scale_min;
    private Integer scale_max;
    private Map<String, String> scale_labels;
}