// InvalidTokenException.java
package com.mindigo.auth_service.exceptions;

public class InvalidTokenException extends AuthenticationException {
    public InvalidTokenException(String message) {
        super(message);
    }
}