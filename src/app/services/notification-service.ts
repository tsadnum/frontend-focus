import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}notifications`;

  constructor(private http: HttpClient) {}

  getUserNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('Error fetching notifications:', err);
        return throwError(() => err);
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/mark-as-read`, {}).pipe(
      catchError(err => {
        console.error(`Error marking notification ${id} as read:`, err);
        return throwError(() => err);
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread-count`).pipe(
      catchError(err => {
        console.error('Error getting unread count:', err);
        return throwError(() => err);
      })
    );
  }

  watchNewNotifications(intervalMs: number = 60_000): Observable<Notification[]> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getUserNotifications()),
      catchError(err => {
        console.error('Error polling notifications:', err);
        return throwError(() => err);
      })
    );
  }
}
