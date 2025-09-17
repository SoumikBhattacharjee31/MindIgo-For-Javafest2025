package com.mindigo.auth_service.exception;

public class MailServerException extends RuntimeException {
    public MailServerException(String message) {
        super(message);
    }
}