package com.mindigo.auth_service.entity;

import lombok.Getter;

@Getter
public enum AdminActionType {
    Counselor_APPLICATION_APPROVED("Counselor Application Approved"),
    Counselor_APPLICATION_REJECTED("Counselor Application Rejected"),
    Counselor_APPLICATION_REVIEWED("Counselor Application Reviewed"),
    USER_ACCOUNT_SUSPENDED("User Account Suspended"),
    USER_ACCOUNT_ACTIVATED("User Account Activated"),
    ADMIN_LOGIN("Admin Login"),
    ADMIN_LOGOUT("Admin Logout"),
    SYSTEM_CONFIGURATION_CHANGED("System Configuration Changed");

    private final String displayName;

    AdminActionType(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
