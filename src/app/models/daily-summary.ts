import {TaskResponseDTO} from './task';
import {GoalResponseDTO} from './goal';
import {FocusSession} from './focus-session';
import {EventResponseDTO} from './event';
import {Habit} from './habit';

export interface DailySummary {
  todayTasks: TaskResponseDTO[];
  activeHabits: Habit[];
  activeGoals: GoalResponseDTO[];
  todayFocusSessions: FocusSession[];
  upcomingEvents: EventResponseDTO[];
}
