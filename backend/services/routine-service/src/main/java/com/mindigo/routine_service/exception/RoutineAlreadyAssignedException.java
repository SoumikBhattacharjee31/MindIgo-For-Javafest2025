package com.mindigo.routine_service.exception;

public class RoutineAlreadyAssignedException extends RuntimeException {
    public RoutineAlreadyAssignedException(String message) {
        super(message);
    }
}
