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
    SYSTEM_ADMIN("System administration");

    private final String description;

    Permission(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return description;
    }
}