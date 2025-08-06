// TokenType.java
package com.mindigo.auth_service.models;

public enum TokenType {
    PASSWORD_RESET("password_reset", 24), // 24 hours
    EMAIL_VERIFICATION("email_verification", 24), // 24 hours
    ACCOUNT_ACTIVATION("account_activation", 72), // 72 hours
    TWO_FACTOR_AUTH("two_factor_auth", 1); // 1 hour

    private final String type;
    private final int defaultExpiryHours;

    TokenType(String type, int defaultExpiryHours) {
        this.type = type;
        this.defaultExpiryHours = defaultExpiryHours;
    }

    public String getType() {
        return type;
    }

    public int getDefaultExpiryHours() {
        return defaultExpiryHours;
    }

    @Override
    public String toString() {
        return type;
    }
}