package com.mindigo.auth_service.entity;

import lombok.Getter;

@Getter
public enum CounselorStatus {
    PENDING_VERIFICATION("Pending Verification", "Application submitted and awaiting admin review"),
    APPROVED("Approved", "Counselor account approved and active"),
    REJECTED("Rejected", "Application rejected by admin"),
    ADDITIONAL_INFO_REQUIRED("Additional Info Required", "More information needed from applicant"),
    SUSPENDED("Suspended", "Counselor account temporarily suspended");

    private final String displayName;
    private final String description;

    CounselorStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    @Override
    public String toString() {
        return displayName;
    }
}