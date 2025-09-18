package com.mindigo.content_service.dto.quiz;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class QuizGenerationRequest {
    private String file_id;
    private List<QuizQuestion> quizzes;

    @Data
    public static class QuizQuestion {
        private String question;
        private String type;
        private List<String> options;
        private Integer scale_min;
        private Integer scale_max;
        private Map<String, String> scale_labels;
    }
}