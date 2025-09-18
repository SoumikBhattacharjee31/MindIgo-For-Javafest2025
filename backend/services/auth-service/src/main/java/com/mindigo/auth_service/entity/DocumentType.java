package com.mindigo.auth_service.entity;

import lombok.Getter;

@Getter
public enum DocumentType {
    MEDICAL_LICENSE("Medical License", "Valid medical practice license", true),
    MEDICAL_DEGREE("Medical Degree", "Medical education degree certificate", true),
    SPECIALTY_CERTIFICATE("Specialty Certificate", "Specialty/residency completion certificate", false),
    IDENTITY_PROOF("Identity Proof", "Government issued ID proof", true),
    PRACTICE_CERTIFICATE("Practice Certificate", "Current practice registration certificate", false);

    private final String displayName;
    private final String description;
    private final boolean required;

    DocumentType(String displayName, String description, boolean required) {
        this.displayName = displayName;
        this.description = description;
        this.required = required;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
