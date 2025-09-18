package com.mindigo.content_service.models.breathing;

public enum BreathingType {
    INHALE("inhale"),
    HOLD("hold"),
    EXHALE("exhale");
    private final String displayName;
    BreathingType(String displayName){this.displayName=displayName;}

    @Override
    public String toString() {
        return this.displayName;
    }
}
