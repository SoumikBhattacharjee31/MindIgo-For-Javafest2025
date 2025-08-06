// RateLimitExceededException.java
package com.mindigo.auth_service.exceptions;

public class RateLimitExceededException extends AuthenticationException {
    public RateLimitExceededException(String message) {
        super(message);
    }
}