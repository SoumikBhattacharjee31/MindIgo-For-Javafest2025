package com.mindigo.auth_service.models;

import lombok.Getter;

@Getter
public enum AuthProvider {
    LOCAL("local"),
    GOOGLE("google"),
    FACEBOOK("facebook"),
    GITHUB("github"),
    LINKEDIN("linkedin");

    private final String providerId;

    AuthProvider(String providerId) {
        this.providerId = providerId;
    }

    public static AuthProvider fromString(String provider) {
        for (AuthProvider authProvider : AuthProvider.values()) {
            if (authProvider.getProviderId().equalsIgnoreCase(provider)) {
                return authProvider;
            }
        }
        return LOCAL;
    }
}