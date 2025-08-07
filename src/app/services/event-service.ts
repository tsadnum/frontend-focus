import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EventRequestDTO, EventResponseDTO } from '../models/event';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = `${environment.apiUrl}events`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<EventResponseDTO[]> {
    return this.http.get<EventResponseDTO[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('Error fetching events:', err);
        return throwError(() => err);
      })
    );
  }

  create(event: EventRequestDTO): Observable<EventResponseDTO> {
    return this.http.post<EventResponseDTO>(this.baseUrl, event).pipe(
      catchError(err => {
        console.error('Error creating event:', err);
        return throwError(() => err);
      })
    );
  }

  update(id: number, event: EventRequestDTO): Observable<EventResponseDTO> {
    return this.http.put<EventResponseDTO>(`${this.baseUrl}/${id}`, event).pipe(
      catchError(err => {
        console.error(`Error updating event ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Error deleting event ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
