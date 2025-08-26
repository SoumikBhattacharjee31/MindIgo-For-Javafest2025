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