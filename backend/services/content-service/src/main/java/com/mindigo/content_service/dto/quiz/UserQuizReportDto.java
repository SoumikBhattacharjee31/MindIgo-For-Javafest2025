package com.mindigo.content_service.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserQuizReportDto {
    private String file_id;
    private List<QuizQuestionDto> quizzes;
    private List<String> answers;
}