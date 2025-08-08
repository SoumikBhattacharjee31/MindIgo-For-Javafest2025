package com.mindigo.admin_service.entity;

import lombok.Getter;

@Getter
public enum AdminActionType {
    DOCTOR_APPLICATION_APPROVED("Doctor Application Approved"),
    DOCTOR_APPLICATION_REJECTED("Doctor Application Rejected"),
    DOCTOR_APPLICATION_REVIEWED("Doctor Application Reviewed"),
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
