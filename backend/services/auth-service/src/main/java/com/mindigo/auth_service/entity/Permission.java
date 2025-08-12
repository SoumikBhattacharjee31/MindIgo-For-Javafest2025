package com.mindigo.auth_service.entity;

import lombok.Getter;

@Getter
public enum Permission {
    READ_PROFILE("Read own profile"),
    UPDATE_PROFILE("Update own profile"),
    UPLOAD_PROFILE_IMAGE("Upload profile image"),
    READ_USERS("Read user list"),
    READ_ALL_USERS("Read all user details"),
    MANAGE_USERS("Manage users"),
    DELETE_USERS("Delete users"),
    MODERATE_CONTENT("Moderate content"),
    SYSTEM_ADMIN("System administration"),
    READ_CLIENTS("Read client list"),
    MANAGE_SESSIONS("Manage counseling sessions"),
    VIEW_CLIENT_HISTORY("View client history"),
    CREATE_PRESCRIPTIONS("Create prescriptions"),
    BOOK_SESSIONS("Book counseling sessions"),
    VIEW_OWN_SESSIONS("View own counseling sessions");

    private final String description;

    Permission(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return description;
    }
}