package com.mindigo.auth_service.models;

import java.util.Set;

public enum Role {
    USER("User", Set.of(
            Permission.READ_PROFILE,
            Permission.UPDATE_PROFILE,
            Permission.UPLOAD_PROFILE_IMAGE
    )),

    MODERATOR("Moderator", Set.of(
            Permission.READ_PROFILE,
            Permission.UPDATE_PROFILE,
            Permission.UPLOAD_PROFILE_IMAGE,
            Permission.READ_USERS,
            Permission.MODERATE_CONTENT
    )),

    ADMIN("Administrator", Set.of(
            Permission.READ_PROFILE,
            Permission.UPDATE_PROFILE,
            Permission.UPLOAD_PROFILE_IMAGE,
            Permission.READ_USERS,
            Permission.READ_ALL_USERS,
            Permission.MANAGE_USERS,
            Permission.DELETE_USERS,
            Permission.MODERATE_CONTENT,
            Permission.SYSTEM_ADMIN
    ));

    private final String displayName;
    private final Set<Permission> permissions;

    Role(String displayName, Set<Permission> permissions) {
        this.displayName = displayName;
        this.permissions = permissions;
    }

    public String getDisplayName() {
        return displayName;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }

    @Override
    public String toString() {
        return displayName;
    }
}