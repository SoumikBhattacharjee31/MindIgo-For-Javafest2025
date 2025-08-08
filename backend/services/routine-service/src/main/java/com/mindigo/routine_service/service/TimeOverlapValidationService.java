package com.mindigo.routine_service.service;


import com.mindigo.routine_service.dto.request.CreateActivityRequest;
import com.mindigo.routine_service.enums.RoutineType;

import java.util.List;

public interface TimeOverlapValidationService {
    void validateTimeOverlaps(List<CreateActivityRequest> activities, RoutineType routineType);
}
