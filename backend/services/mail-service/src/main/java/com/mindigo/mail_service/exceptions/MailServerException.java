package com.mindigo.mail_service.exceptions;

public class MailServerException extends RuntimeException {
    public MailServerException(String message) {
        super(message);
    }
}