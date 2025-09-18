package com.mindigo.content_service.exceptions.quiz;

public class QuizNotFound extends RuntimeException {
    public QuizNotFound(String message) {
        super(message);
    }
}
