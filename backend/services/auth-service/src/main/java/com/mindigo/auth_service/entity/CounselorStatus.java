package com.mindigo.auth_service.entity;

public enum CounselorStatus {
    PENDING_VERIFICATION("Pending Verification"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    SUSPENDED("Suspended");

    private final String displayName;

    CounselorStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
