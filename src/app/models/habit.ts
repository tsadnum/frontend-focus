export interface Habit {
  id?: number;
  name: string;
  description: string;
  activeDays: string[];
  reminderTimes: string[];
  active: boolean;
  icon?: string;
}

export interface DashboardHabit extends Habit {
  completedToday: boolean;
  currentStreak: number;
}

export interface HabitLogRequest {
  habitId: number;
  completionTime: string;
  completed: boolean;
}
