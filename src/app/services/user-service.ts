import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserRequestDTO, UserResponseDTO } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getCurrentUserProfile(): Observable<UserResponseDTO> {
    return this.http.get<UserResponseDTO>(`${this.baseUrl}user/profile`).pipe(
      catchError(err => {
        console.error('Error fetching user profile:', err);
        return throwError(() => err);
      })
    );
  }

  getUsers(params?: {
    startDate?: Date,
    endDate?: Date,
    status?: string
  }): Observable<UserResponseDTO[]> {
    let httpParams = new HttpParams();

    if (params?.startDate) {
      httpParams = httpParams.set('startDate', params.startDate.toISOString().split('T')[0]);
    }

    if (params?.endDate) {
      httpParams = httpParams.set('endDate', params.endDate.toISOString().split('T')[0]);
    }

    if (params?.status?.trim()) {
      httpParams = httpParams.set('status', params.status.trim());
    }

    return this.http.get<UserResponseDTO[]>(`${this.baseUrl}admin/users`, { params: httpParams }).pipe(
      catchError(err => {
        console.error('Error fetching users:', err);
        return throwError(() => err);
      })
    );
  }

  updateUser(id: number, dto: UserRequestDTO): Observable<UserResponseDTO> {
    return this.http.put<UserResponseDTO>(`${this.baseUrl}admin/users/${id}`, dto).pipe(
      catchError(err => {
        console.error(`Error updating user ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
