// UserNotFoundException.java
package com.mindigo.auth_service.exceptions;

public class UserNotFoundException extends AuthenticationException {
    public UserNotFoundException(String message) {
        super(message);
    }
}