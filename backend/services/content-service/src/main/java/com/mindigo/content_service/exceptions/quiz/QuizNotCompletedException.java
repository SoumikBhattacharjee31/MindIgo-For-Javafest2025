package com.mindigo.content_service.exceptions.quiz;

public class QuizNotCompletedException extends RuntimeException {
    public QuizNotCompletedException(String message) {
        super(message);
    }
}
