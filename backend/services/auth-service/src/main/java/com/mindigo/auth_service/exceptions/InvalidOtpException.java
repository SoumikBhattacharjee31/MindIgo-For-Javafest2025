// InvalidOtpException.java
package com.mindigo.auth_service.exceptions;

public class InvalidOtpException extends AuthenticationException {
    public InvalidOtpException(String message) {
        super(message);
    }
}