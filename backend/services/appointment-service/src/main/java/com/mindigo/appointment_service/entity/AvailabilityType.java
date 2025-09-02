package com.mindigo.appointment_service.entity;

public enum AvailabilityType {
    AVAILABLE,    // Exception to make time available (override unavailable day)
    UNAVAILABLE   // Exception to make time unavailable (override available time)
}