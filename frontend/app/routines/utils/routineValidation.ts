// utils/routineValidation.ts
import { CreateActivityRequest, RoutineType, DayOfWeek, ValidationError, TimeSlot } from '../types/routine';

export const validateRoutine = (
  activities: CreateActivityRequest[],
  routineType: RoutineType
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (activities.length === 0) {
    errors.push({ field: 'activities', message: 'At least one activity is required' });
    return errors;
  }

  // Group activities by day for overlap checking
  const activitiesByDay: Record<string, CreateActivityRequest[]> = {};

  activities.forEach((activity, index) => {
    // Validate individual activity
    const activityErrors = validateActivity(activity, index);
    errors.push(...activityErrors);

    // Group for time overlap checking
    if (routineType === RoutineType.WEEKLY) {
      if (!activity.dayOfWeek) {
        errors.push({ 
          field: `activities[${index}].dayOfWeek`, 
          message: 'Day of week is required for weekly routines' 
        });
        return;
      }
      const day = activity.dayOfWeek;
      if (!activitiesByDay[day]) activitiesByDay[day] = [];
      activitiesByDay[day].push(activity);
    } else {
      // For daily routines, group all activities together
      const day = 'daily';
      if (!activitiesByDay[day]) activitiesByDay[day] = [];
      activitiesByDay[day].push(activity);
    }
  });

  // Check for time overlaps within each day
  Object.entries(activitiesByDay).forEach(([day, dayActivities]) => {
    const overlapErrors = checkTimeOverlaps(dayActivities, day);
    errors.push(...overlapErrors);
  });

  return errors;
};

const validateActivity = (activity: CreateActivityRequest, index: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!activity.activityName?.trim()) {
    errors.push({ field: `activities[${index}].activityName`, message: 'Activity name is required' });
  }

  if (!activity.activityType) {
    errors.push({ field: `activities[${index}].activityType`, message: 'Activity type is required' });
  }

  if (!activity.startTime) {
    errors.push({ field: `activities[${index}].startTime`, message: 'Start time is required' });
  }

  if (!activity.endTime) {
    errors.push({ field: `activities[${index}].endTime`, message: 'End time is required' });
  }

  if (activity.startTime && activity.endTime) {
    if (!isValidTimeFormat(activity.startTime)) {
      errors.push({ field: `activities[${index}].startTime`, message: 'Invalid time format (HH:MM)' });
    }

    if (!isValidTimeFormat(activity.endTime)) {
      errors.push({ field: `activities[${index}].endTime`, message: 'Invalid time format (HH:MM)' });
    }

    if (isValidTimeFormat(activity.startTime) && isValidTimeFormat(activity.endTime)) {
      if (timeToMinutes(activity.startTime) >= timeToMinutes(activity.endTime)) {
        errors.push({ 
          field: `activities[${index}].endTime`, 
          message: 'End time must be after start time' 
        });
      }
    }
  }

  return errors;
};

const checkTimeOverlaps = (activities: CreateActivityRequest[], day: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Sort activities by start time
  const sortedActivities = [...activities].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (let i = 0; i < sortedActivities.length - 1; i++) {
    const current = sortedActivities[i];
    const next = sortedActivities[i + 1];

    const currentEnd = timeToMinutes(current.endTime);
    const nextStart = timeToMinutes(next.startTime);

    if (currentEnd > nextStart) {
      errors.push({
        field: 'activities',
        message: `Time overlap detected ${day !== 'daily' ? `on ${day}` : ''} between "${current.activityName}" (${current.startTime}-${current.endTime}) and "${next.activityName}" (${next.startTime}-${next.endTime})`
      });
    }
  }

  return errors;
};

export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const getDayDisplayName = (day: DayOfWeek): string => {
  const dayNames: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: 'Monday',
    [DayOfWeek.TUESDAY]: 'Tuesday',
    [DayOfWeek.WEDNESDAY]: 'Wednesday',
    [DayOfWeek.THURSDAY]: 'Thursday',
    [DayOfWeek.FRIDAY]: 'Friday',
    [DayOfWeek.SATURDAY]: 'Saturday',
    [DayOfWeek.SUNDAY]: 'Sunday'
  };
  return dayNames[day];
};

export const getActivityTypeDisplayName = (type: string): string => {
  const typeNames: Record<string, string> = {
    FOOD: 'Food & Nutrition',
    EXERCISE: 'Exercise',
    SLEEP: 'Sleep',
    MEDITATION: 'Meditation',
    CUSTOM: 'Custom Activity'
  };
  return typeNames[type] || type;
};

export const getActivityTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    FOOD: 'bg-green-100 text-green-800',
    EXERCISE: 'bg-blue-100 text-blue-800',
    SLEEP: 'bg-purple-100 text-purple-800',
    MEDITATION: 'bg-indigo-100 text-indigo-800',
    CUSTOM: 'bg-gray-100 text-gray-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};