// UserNotFoundException.java
package com.mindigo.auth_service.exception;

public class UserNotFoundException extends AuthenticationException {
    public UserNotFoundException(String message) {
        super(message);
    }
}