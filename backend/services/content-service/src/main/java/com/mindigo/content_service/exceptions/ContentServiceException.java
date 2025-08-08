package com.mindigo.content_service.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ContentServiceException extends RuntimeException {
    public ContentServiceException(String message) {
        super(message);
    }
}