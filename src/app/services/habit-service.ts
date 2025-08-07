import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Habit, HabitLogRequest } from '../models/habit';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly baseUrl = `${environment.apiUrl}habits`;
  private readonly logUrl = `${environment.apiUrl}habit-logs`;

  constructor(private http: HttpClient) {}

  getHabits(): Observable<Habit[]> {
    return this.http.get<Habit[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('Error fetching habits:', err);
        return throwError(() => err);
      })
    );
  }

  createHabit(habit: Habit): Observable<Habit> {
    return this.http.post<Habit>(this.baseUrl, habit).pipe(
      catchError(err => {
        console.error('Error creating habit:', err);
        return throwError(() => err);
      })
    );
  }

  updateHabit(id: number, habit: Habit): Observable<Habit> {
    return this.http.put<Habit>(`${this.baseUrl}/${id}`, habit).pipe(
      catchError(err => {
        console.error(`Error updating habit ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  deleteHabit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Error deleting habit ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  logHabit(log: HabitLogRequest): Observable<void> {
    return this.http.post<void>(this.logUrl, log).pipe(
      catchError(err => {
        console.error('Error logging habit:', err);
        return throwError(() => err);
      })
    );
  }
}
