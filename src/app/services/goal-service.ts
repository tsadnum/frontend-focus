import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GoalRequestDTO, GoalResponseDTO } from '../models/goal';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly baseUrl = `${environment.apiUrl}goals`;

  constructor(private http: HttpClient) {}

  getGoals(): Observable<GoalResponseDTO[]> {
    return this.http.get<GoalResponseDTO[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('Error fetching goals:', err);
        return throwError(() => err);
      })
    );
  }

  createGoal(dto: GoalRequestDTO): Observable<GoalResponseDTO> {
    return this.http.post<GoalResponseDTO>(this.baseUrl, dto).pipe(
      catchError(err => {
        console.error('Error creating goal:', err);
        return throwError(() => err);
      })
    );
  }

  updateGoal(id: number, dto: GoalRequestDTO): Observable<GoalResponseDTO> {
    return this.http.put<GoalResponseDTO>(`${this.baseUrl}/${id}`, dto).pipe(
      catchError(err => {
        console.error(`Error updating goal ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Error deleting goal ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
