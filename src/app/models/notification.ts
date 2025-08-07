export enum NotificationType {
  TASK_DUE_SOON = 'TASK_DUE_SOON',
  HABIT_MISSED = 'HABIT_MISSED',
  GOAL_NEAR_DEADLINE = 'GOAL_NEAR_DEADLINE',
  FOCUS_REMINDER = 'FOCUS_REMINDER',
  UPCOMING_EVENT = 'UPCOMING_EVENT',
  PHYSICAL_ACTIVITY_MISSED = 'PHYSICAL_ACTIVITY_MISSED',
  TASK_DUE = 'TASK_DUE',
  EVENT_UPCOMING = 'EVENT_UPCOMING'
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  sentAt: string;
  isRead: boolean;
}
