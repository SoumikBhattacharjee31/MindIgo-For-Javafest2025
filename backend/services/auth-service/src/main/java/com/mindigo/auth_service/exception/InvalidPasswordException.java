// InvalidOtpException.java
package com.mindigo.auth_service.exception;

public class InvalidPasswordException extends AuthenticationException {
    public InvalidPasswordException(String message) {
        super(message);
    }
}