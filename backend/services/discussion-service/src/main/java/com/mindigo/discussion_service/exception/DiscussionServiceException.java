package com.mindigo.discussion_service.exception;

public class DiscussionServiceException extends RuntimeException {
    public DiscussionServiceException(String message) {
        super(message);
    }

    public DiscussionServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}