// InvalidOtpException.java
package com.mindigo.auth_service.exception;

public class InvalidOtpException extends AuthenticationException {
    public InvalidOtpException(String message) {
        super(message);
    }
}