// types/routine.ts
export enum ActivityType {
  FOOD = "FOOD",
  EXERCISE = "EXERCISE",
  SLEEP = "SLEEP",
  MEDITATION = "MEDITATION",
  CUSTOM = "CUSTOM",
}

export enum RoutineType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  CUSTOM = "CUSTOM",
}

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export interface CreateActivityRequest {
  activityName: string;
  activityType: ActivityType;
  description?: string;
  startTime: string; // LocalTime format "HH:mm"
  endTime: string; // LocalTime format "HH:mm"
  dayOfWeek?: DayOfWeek;
  instructions?: string;
}

export interface ActivityResponse {
  id: number;
  activityName: string;
  activityType: ActivityType;
  description?: string;
  startTime: string;
  endTime: string;
  dayOfWeek?: DayOfWeek;
  instructions?: string;
  isActive: boolean;
}

export interface CreateRoutineRequest {
  name: string;
  description?: string;
  doctorId: number;
  routineType: RoutineType;
  activities: CreateActivityRequest[];
}

export interface RoutineResponse {
  id: number;
  name: string;
  description?: string;
  doctorId: number;
  routineType: RoutineType;
  activities: ActivityResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignRoutineRequest {
  patientId: number;
  routineId: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  day?: DayOfWeek;
}

export interface ValidationError {
  field: string;
  message: string;
}
