// OtpType.java
package com.mindigo.auth_service.models;

import lombok.Getter;

@Getter
public enum OtpType {
    EMAIL_VERIFICATION("Email Verification", 10), // 10 minutes
    LOGIN_VERIFICATION("Login Verification", 5),   // 5 minutes
    PASSWORD_RESET("Password Reset", 15),          // 15 minutes
    TWO_FACTOR_AUTH("Two Factor Auth", 5);         // 5 minutes

    private final String displayName;
    private final int defaultExpiryMinutes;

    OtpType(String displayName, int defaultExpiryMinutes) {
        this.displayName = displayName;
        this.defaultExpiryMinutes = defaultExpiryMinutes;
    }

}