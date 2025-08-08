// InvalidCredentialsException.java
package com.mindigo.auth_service.exception;

public class InvalidCredentialsException extends AuthenticationException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}