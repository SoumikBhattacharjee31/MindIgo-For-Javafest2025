package com.mindigo.routine_service.service.impl;

import com.mindigo.routine_service.dto.request.CreateActivityRequest;
import com.mindigo.routine_service.enums.DayOfWeek;
import com.mindigo.routine_service.enums.RoutineType;
import com.mindigo.routine_service.exception.TimeOverlapException;
import com.mindigo.routine_service.service.TimeOverlapValidationService;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TimeOverlapValidationServiceImpl implements TimeOverlapValidationService {

    @Override
    public void validateTimeOverlaps(List<CreateActivityRequest> activities, RoutineType routineType) {
        // Validate that end time is after start time for each activity
        validateActivityTimes(activities);

        switch (routineType) {
            case DAILY:
                validateDailyOverlaps(activities);
                break;
            case WEEKLY:
                validateWeeklyOverlaps(activities);
                break;
            case CUSTOM:
                validateCustomOverlaps(activities);
                break;
        }
    }

    private void validateActivityTimes(List<CreateActivityRequest> activities) {
        for (CreateActivityRequest activity : activities) {
            if (activity.getEndTime().isBefore(activity.getStartTime()) ||
                    activity.getEndTime().equals(activity.getStartTime())) {
                throw new TimeOverlapException(
                        String.format("End time must be after start time for activity: %s",
                                activity.getActivityName())
                );
            }
        }
    }

    private void validateDailyOverlaps(List<CreateActivityRequest> activities) {
        // For daily routines, all activities should apply to every day
        // Check for time overlaps across all activities
        for (int i = 0; i < activities.size(); i++) {
            for (int j = i + 1; j < activities.size(); j++) {
                CreateActivityRequest activity1 = activities.get(i);
                CreateActivityRequest activity2 = activities.get(j);

                if (hasTimeOverlap(activity1.getStartTime(), activity1.getEndTime(),
                        activity2.getStartTime(), activity2.getEndTime())) {
                    throw new TimeOverlapException(
                            String.format("Time overlap detected between activities: %s and %s",
                                    activity1.getActivityName(), activity2.getActivityName())
                    );
                }
            }
        }
    }

    private void validateWeeklyOverlaps(List<CreateActivityRequest> activities) {
        // Group activities by day of week
        Map<DayOfWeek, List<CreateActivityRequest>> activitiesByDay = activities.stream()
                .filter(activity -> activity.getDayOfWeek() != null)
                .collect(Collectors.groupingBy(CreateActivityRequest::getDayOfWeek));

        // Check for overlaps within each day
        for (Map.Entry<DayOfWeek, List<CreateActivityRequest>> entry : activitiesByDay.entrySet()) {
            List<CreateActivityRequest> dayActivities = entry.getValue();

            for (int i = 0; i < dayActivities.size(); i++) {
                for (int j = i + 1; j < dayActivities.size(); j++) {
                    CreateActivityRequest activity1 = dayActivities.get(i);
                    CreateActivityRequest activity2 = dayActivities.get(j);

                    if (hasTimeOverlap(activity1.getStartTime(), activity1.getEndTime(),
                            activity2.getStartTime(), activity2.getEndTime())) {
                        throw new TimeOverlapException(
                                String.format("Time overlap detected on %s between activities: %s and %s",
                                        entry.getKey(), activity1.getActivityName(), activity2.getActivityName())
                        );
                    }
                }
            }
        }

        // Validate that weekly activities have dayOfWeek specified
        List<CreateActivityRequest> activitiesWithoutDay = activities.stream()
                .filter(activity -> activity.getDayOfWeek() == null)
                .collect(Collectors.toList());

        if (!activitiesWithoutDay.isEmpty()) {
            throw new TimeOverlapException("Weekly routine activities must specify a day of the week");
        }
    }

    private void validateCustomOverlaps(List<CreateActivityRequest> activities) {
        // For custom routines, we can be more flexible
        // Group by day if specified, otherwise treat as daily
        Map<DayOfWeek, List<CreateActivityRequest>> activitiesByDay = activities.stream()
                .filter(activity -> activity.getDayOfWeek() != null)
                .collect(Collectors.groupingBy(CreateActivityRequest::getDayOfWeek));

        List<CreateActivityRequest> activitiesWithoutDay = activities.stream()
                .filter(activity -> activity.getDayOfWeek() == null)
                .collect(Collectors.toList());

        // Check overlaps for activities without specific days
        if (!activitiesWithoutDay.isEmpty()) {
            validateDailyOverlaps(activitiesWithoutDay);
        }

        // Check overlaps within each specific day
        for (Map.Entry<DayOfWeek, List<CreateActivityRequest>> entry : activitiesByDay.entrySet()) {
            List<CreateActivityRequest> dayActivities = entry.getValue();

            for (int i = 0; i < dayActivities.size(); i++) {
                for (int j = i + 1; j < dayActivities.size(); j++) {
                    CreateActivityRequest activity1 = dayActivities.get(i);
                    CreateActivityRequest activity2 = dayActivities.get(j);

                    if (hasTimeOverlap(activity1.getStartTime(), activity1.getEndTime(),
                            activity2.getStartTime(), activity2.getEndTime())) {
                        throw new TimeOverlapException(
                                String.format("Time overlap detected on %s between activities: %s and %s",
                                        entry.getKey(), activity1.getActivityName(), activity2.getActivityName())
                        );
                    }
                }
            }
        }
    }

    private boolean hasTimeOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        // Two time ranges overlap if one starts before the other ends
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
