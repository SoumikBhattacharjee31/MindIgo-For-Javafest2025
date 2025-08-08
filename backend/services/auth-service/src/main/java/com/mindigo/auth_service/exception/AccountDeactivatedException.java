// AccountDeactivatedException.java
package com.mindigo.auth_service.exception;

public class AccountDeactivatedException extends AuthenticationException {
    public AccountDeactivatedException(String message) {
        super(message);
    }
}