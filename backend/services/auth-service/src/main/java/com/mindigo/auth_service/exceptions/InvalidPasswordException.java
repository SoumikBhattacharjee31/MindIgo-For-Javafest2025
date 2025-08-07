// InvalidOtpException.java
package com.mindigo.auth_service.exceptions;

public class InvalidPasswordException extends AuthenticationException {
    public InvalidPasswordException(String message) {
        super(message);
    }
}