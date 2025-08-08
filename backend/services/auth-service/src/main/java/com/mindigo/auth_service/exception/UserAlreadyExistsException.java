// UserAlreadyExistsException.java
package com.mindigo.auth_service.exception;

public class UserAlreadyExistsException extends AuthenticationException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}