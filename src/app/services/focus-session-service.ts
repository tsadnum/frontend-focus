import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FocusSession } from '../models/focus-session';

@Injectable({ providedIn: 'root' })
export class FocusSessionService {
  private readonly baseUrl = `${environment.apiUrl}focus-sessions`;

  constructor(private http: HttpClient) {}

  createSession(dto: FocusSession): Observable<FocusSession> {
    return this.http.post<FocusSession>(this.baseUrl, dto).pipe(
      catchError(err => {
        console.error('Error creating focus session:', err);
        return throwError(() => err);
      })
    );
  }

  getTodaySessions(): Observable<FocusSession[]> {
    return this.http.get<FocusSession[]>(`${this.baseUrl}/today`).pipe(
      catchError(err => {
        console.error('Error fetching today focus sessions:', err);
        return throwError(() => err);
      })
    );
  }
}
