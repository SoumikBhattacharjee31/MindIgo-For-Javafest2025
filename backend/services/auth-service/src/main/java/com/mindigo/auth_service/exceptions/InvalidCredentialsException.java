// InvalidCredentialsException.java
package com.mindigo.auth_service.exceptions;

public class InvalidCredentialsException extends AuthenticationException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}