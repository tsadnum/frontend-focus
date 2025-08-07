import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TaskRequestDTO, TaskResponseDTO } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseUrl = `${environment.apiUrl}tasks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('Error fetching tasks:', err);
        return throwError(() => err);
      })
    );
  }

  getByType(type: string): Observable<TaskResponseDTO[]> {
    return this.http.get<TaskResponseDTO[]>(`${this.baseUrl}/type/${type}`).pipe(
      catchError(err => {
        console.error(`Error fetching tasks by type "${type}":`, err);
        return throwError(() => err);
      })
    );
  }

  getKanban(): Observable<Record<string, TaskResponseDTO[]>> {
    return this.http.get<Record<string, TaskResponseDTO[]>>(`${this.baseUrl}/kanban`).pipe(
      catchError(err => {
        console.error('Error fetching kanban tasks:', err);
        return throwError(() => err);
      })
    );
  }

  create(task: TaskRequestDTO): Observable<TaskResponseDTO> {
    return this.http.post<TaskResponseDTO>(this.baseUrl, task).pipe(
      catchError(err => {
        console.error('Error creating task:', err);
        return throwError(() => err);
      })
    );
  }

  update(id: number, task: TaskRequestDTO): Observable<TaskResponseDTO> {
    return this.http.put<TaskResponseDTO>(`${this.baseUrl}/${id}`, task).pipe(
      catchError(err => {
        console.error(`Error updating task ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Error deleting task ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
