// BadRequestException.java
package com.mindigo.auth_service.exceptions;

public class BadRequestException extends AuthenticationException {
    public BadRequestException(String message) {
        super(message);
    }
}