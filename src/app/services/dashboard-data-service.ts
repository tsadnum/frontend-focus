import { Injectable, signal } from '@angular/core';
import { DiaryEntryResponseDTO } from '../models/diary-entry';
import { EventResponseDTO } from '../models/event';
import { GoalResponseDTO } from '../models/goal';
import { DashboardHabit } from '../models/habit';
import { TaskResponseDTO } from '../models/task';
import { UserResponseDTO } from '../models/user';
import { DiaryEntryService } from './diary-entry-service';
import { DailySummaryService } from './daily-summary-service';
import { UserService } from './user-service';
import { forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly loading = signal(true);

  readonly diaryEntries = signal<DiaryEntryResponseDTO[]>([]);
  readonly events = signal<EventResponseDTO[]>([]);
  readonly goals = signal<GoalResponseDTO[]>([]);
  readonly habits = signal<DashboardHabit[]>([]);
  readonly tasks = signal<TaskResponseDTO[]>([]);
  readonly user = signal<UserResponseDTO | null>(null);

  constructor(
    private diaryService: DiaryEntryService,
    private eventService: DailySummaryService,
    private goalService: DailySummaryService,
    private habitService: DailySummaryService,
    private taskService: DailySummaryService,
    private userService: UserService
  ) {}

  loadDashboardData(): void {
    this.loading.set(true);

    forkJoin({
      diary: this.diaryService.getAll(),
      events: this.eventService.getUpcomingEvents(),
      goals: this.goalService.getActiveGoals(),
      habits: this.habitService.getActiveHabits(),
      tasks: this.taskService.getTodayTasks(),
      user: this.userService.getCurrentUserProfile()
    }).subscribe({
      next: (res) => {
        this.diaryEntries.set([...res.diary]);
        this.events.set([...res.events]);
        this.goals.set([...res.goals]);
        this.habits.set([...(res.habits)].map(habit => ({...habit, completedToday: false,currentStreak: 0 }) as DashboardHabit));
        this.tasks.set([...res.tasks]);
        this.user.set({ ...res.user });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading.set(false);
      }
    });
  }

  isLoading(): boolean {
    return this.loading();
  }
}
