// TooManyAttemptsException.java
package com.mindigo.auth_service.exceptions;

public class TooManyAttemptsException extends AuthenticationException {
    public TooManyAttemptsException(String message) {
        super(message);
    }
}