export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  progress: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content: string;
  completed: boolean;
  completion_date?: string;
  duration_minutes: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  audio_url?: string;
}

export interface UserProgress {
  total_lessons: number;
  completed_lessons: number;
  total_goals: number;
  completed_goals: number;
  streak_days: number;
  last_activity: string;
}