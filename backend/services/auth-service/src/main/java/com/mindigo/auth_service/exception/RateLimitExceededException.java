// RateLimitExceededException.java
package com.mindigo.auth_service.exception;

public class RateLimitExceededException extends AuthenticationException {
    public RateLimitExceededException(String message) {
        super(message);
    }
}