package com.mindigo.content_service.exceptions.quiz;

public class IncompleteQuizException extends RuntimeException {
    public IncompleteQuizException(String message) {
        super(message);
    }
}
