package com.mindigo.auth_service.exception;

import lombok.Getter;

@Getter
public class AccountNotApprovedException extends RuntimeException {
    private final String errorCode;

    public AccountNotApprovedException(String message) {
        super(message);
        this.errorCode = null;
    }

    public AccountNotApprovedException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

}