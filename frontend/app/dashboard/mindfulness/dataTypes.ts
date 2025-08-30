export interface Reason {
  text: string;
  emoji: string;
  color: string;
  moods: string[]; // A reason can be associated with multiple moods
}

export interface Description {
  text: string;
  emoji: string;
  color: string;
  moods: string[]; // A description can be associated with multiple moods
}

export interface Mood {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export interface Entry {
  date: string;
  mood: string;
  description: string;
  reason: string;
}

export interface Cycle{
  duration: number; // in seconds
  task: BreathingTask[];
}

export interface BreathingTask {
  order: number;
  type: "inhale" | "hold" | "exhale";
  duration: number; // in seconds
}

export interface BreathingExercise{
  id: number;
  title: string;
  description: string;
  pattern: string;
  duration: number; // in minutes
  cycle: Cycle;
}

export interface LastSession {
  exerciseTitle: string;
  completedCycles: number;
  totalCycles: number;
  date: string;
  duration: number;
  gradient: string;
}

