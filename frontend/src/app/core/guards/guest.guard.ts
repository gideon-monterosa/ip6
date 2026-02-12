import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is authenticated, redirect to home
  if (authService.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }

  // If not authenticated, allow access to login/register
  return true;
};
