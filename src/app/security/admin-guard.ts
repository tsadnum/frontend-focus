import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();

  const token = localStorage.getItem('authToken');

  if (!token || jwtHelper.isTokenExpired(token)) {
    router.navigate(['/auth/login']);
    return false;
  }

  try {
    const decoded = jwtHelper.decodeToken(token);
    const roles: string[] = decoded?.roles || [];

    if (roles.includes('ROLE_ADMIN')) {
      return true;
    }
  } catch (e) {
    console.warn('[adminGuard] Error decoding token:', e);
  }

  router.navigate(['/']);
  return false;
};
