// InvalidTokenException.java
package com.mindigo.auth_service.exception;

public class InvalidTokenException extends AuthenticationException {
    public InvalidTokenException(String message) {
        super(message);
    }
}