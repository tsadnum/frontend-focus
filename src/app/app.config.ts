import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { routes } from './app.routes';
import { authInterceptor } from './security/auth.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';

export const API_BASE_URL = 'http://localhost:8080';

export const PUBLIC_ROUTES = [
  `${API_BASE_URL}/auth/login`,
  `${API_BASE_URL}/auth/register`
];

export const ALLOWED_DOMAINS = ['localhost:8080'];

export function tokenGetter() {
  return localStorage.getItem('authToken');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNativeDateAdapter(),

    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: ALLOWED_DOMAINS,
        disallowedRoutes: PUBLIC_ROUTES
      }
    }).providers!
  ]
};
