import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}auth`;
  private readonly tokenKey = 'authToken';
  private readonly jwtHelper = new JwtHelperService();

  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {
    console.log('[AuthService] Initialized with token:', this.getToken());

    setInterval(() => {
      const token = this.getToken();
      if (token && this.jwtHelper.isTokenExpired(token)) {
        console.log('[AuthService] Token expired, logging out.');
        this.logout();
      }
    }, 60_000);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap({
        next: (response) => {
          this.setToken(response.token);
          this.loggedIn$.next(true);
        },
        error: (error) => {
          console.error('[AuthService] Login failed:', error);
        }
      })
    );
  }

  register(firstName: string, lastName: string, email: string, password: string): Observable<AuthResponse> {
    const body = { firstName, lastName, email, password };

    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, body).pipe(
      tap({
        next: (response) => {
          this.setToken(response.token);
          this.loggedIn$.next(true);
        },
        error: (error) => {
          console.error('[AuthService] Registration failed:', error);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUserRoles(): string[] {
    try {
      const token = this.getToken();
      if (token && !this.jwtHelper.isTokenExpired(token)) {
        const decoded = this.jwtHelper.decodeToken(token);
        return decoded?.roles || [];
      }
    } catch (e) {
      console.warn('[AuthService] Failed to decode token:', e);
    }
    return [];
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
