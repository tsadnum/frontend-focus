import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  DiaryEntryRequestDTO,
  DiaryEntryResponseDTO
} from '../models/diary-entry';

@Injectable({ providedIn: 'root' })
export class DiaryEntryService {
  private readonly baseUrl = `${environment.apiUrl}diary`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DiaryEntryResponseDTO[]> {
    return this.http.get<DiaryEntryResponseDTO[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('Error fetching diary entries:', err);
        return throwError(() => err);
      })
    );
  }

  create(dto: DiaryEntryRequestDTO): Observable<DiaryEntryResponseDTO> {
    return this.http.post<DiaryEntryResponseDTO>(this.baseUrl, dto).pipe(
      catchError(err => {
        console.error('Error creating diary entry:', err);
        return throwError(() => err);
      })
    );
  }

  update(id: number, dto: DiaryEntryRequestDTO): Observable<DiaryEntryResponseDTO> {
    return this.http.put<DiaryEntryResponseDTO>(`${this.baseUrl}/${id}`, dto).pipe(
      catchError(err => {
        console.error(`Error updating diary entry ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(err => {
        console.error(`Error deleting diary entry ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
