package com.mindigo.admin_service.entity;

import lombok.Getter;

@Getter
public enum CounselorApplicationStatus {
    PENDING("Pending Review", "Application submitted and awaiting admin review"),
    UNDER_REVIEW("Under Review", "Application is being reviewed by admin"),
    APPROVED("Approved", "Application approved, Counselor account activated"),
    REJECTED("Rejected", "Application rejected by admin"),
    ADDITIONAL_INFO_REQUIRED("Additional Info Required", "More information needed from applicant");

    private final String displayName;
    private final String description;

    CounselorApplicationStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
