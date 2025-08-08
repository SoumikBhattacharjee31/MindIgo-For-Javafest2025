// TooManyAttemptsException.java
package com.mindigo.auth_service.exception;

public class TooManyAttemptsException extends AuthenticationException {
    public TooManyAttemptsException(String message) {
        super(message);
    }
}