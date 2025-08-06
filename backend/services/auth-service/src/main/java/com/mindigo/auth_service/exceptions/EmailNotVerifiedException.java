// EmailNotVerifiedException.java
package com.mindigo.auth_service.exceptions;

public class EmailNotVerifiedException extends AuthenticationException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}