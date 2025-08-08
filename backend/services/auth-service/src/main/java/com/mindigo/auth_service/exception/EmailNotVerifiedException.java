// EmailNotVerifiedException.java
package com.mindigo.auth_service.exception;

public class EmailNotVerifiedException extends AuthenticationException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}