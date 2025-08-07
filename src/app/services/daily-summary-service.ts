import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DailySummary } from '../models/daily-summary';
import { Habit } from '../models/habit';
import { TaskResponseDTO } from '../models/task';
import { GoalResponseDTO } from '../models/goal';
import { EventResponseDTO } from '../models/event';

@Injectable({ providedIn: 'root' })
export class DailySummaryService {
  private readonly baseUrl = `${environment.apiUrl}summary/today`;
  private summary$?: Observable<DailySummary>;

  constructor(private http: HttpClient) {}

  private loadSummary(): Observable<DailySummary> {
    if (!this.summary$) {
      this.summary$ = this.http.get<DailySummary>(this.baseUrl).pipe(
        shareReplay(1),
        catchError(err => {
          console.error('Error loading daily summary:', err);
          return of({
            todayTasks: [],
            activeHabits: [],
            activeGoals: [],
            todayFocusSessions:[],
            upcomingEvents: []
          } as DailySummary);
        })
      );
    }
    return this.summary$;
  }

  getTodayTasks(): Observable<TaskResponseDTO[]> {
    return this.loadSummary().pipe(map(summary => summary.todayTasks));
  }

  getActiveHabits(): Observable<Habit[]> {
    return this.loadSummary().pipe(map(summary => summary.activeHabits));
  }

  getActiveGoals(): Observable<GoalResponseDTO[]> {
    return this.loadSummary().pipe(map(summary => summary.activeGoals));
  }

  getUpcomingEvents(): Observable<EventResponseDTO[]> {
    return this.loadSummary().pipe(map(summary => summary.upcomingEvents));
  }

}
