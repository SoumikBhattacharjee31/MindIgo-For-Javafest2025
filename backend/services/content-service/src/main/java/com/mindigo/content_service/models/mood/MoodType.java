package com.mindigo.content_service.models.mood;

public enum MoodType {
    AMAZING("amazing"),
    HAPPY("happy"),
    NEUTRAL("neutral"),
    SAD("sad"),
    TERRIBLE("terrible"),
    ANGRY("angry"),
    ANXIOUS("anxious"),
    EXCITED("excited"),
    RELAXED("relaxed"),
    MOTIVATED("motivated");
    private final String displayName;

    MoodType(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
