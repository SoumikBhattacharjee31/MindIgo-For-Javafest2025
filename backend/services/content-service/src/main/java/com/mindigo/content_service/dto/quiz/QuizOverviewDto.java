package com.mindigo.content_service.dto.quiz;

import com.mindigo.content_service.models.quiz.Quiz;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizOverviewDto {
    private String quizCode;
    private String fileId;
    private List<Quiz> questions;
    private List<String> completedUsers;
}