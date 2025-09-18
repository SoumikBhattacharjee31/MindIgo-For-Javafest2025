package com.mindigo.content_service.exceptions.quiz;

public class AlreadyCompletedException extends RuntimeException {
    public AlreadyCompletedException(String message) {
        super(message);
    }
}
