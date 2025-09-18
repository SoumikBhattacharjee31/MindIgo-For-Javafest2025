package com.mindigo.content_service.dto.quiz;

import com.mindigo.content_service.models.quiz.Quiz;
import com.mindigo.content_service.models.quiz.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizSessionResponse {
    private Long sessionId;
    private String quizCode;
    private Integer currentQuestionSequence;
    private Integer totalQuestions;
    private Double progressPercentage;
    private SessionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Quiz currentQuestion;
    private String message;
}