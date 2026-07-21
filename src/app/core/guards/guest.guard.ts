import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';

// Check Guest Access
function isGuest(): boolean {
  const authService = inject(AuthService);

  const router = inject(Router);

  // User is NOT logged in
  if (!authService.isLoggedIn()) {
    return true;
  }

  // Logged in as Admin
  if (authService.isAdmin()) {
    router.navigate(['/admin']);

    return false;
  }

  // Logged in as Customer
  router.navigate(['/']);

  return false;
}


// Can Activate
export const guestGuard: CanActivateFn = () => {
  return isGuest();
};

// Can Activate Child
export const guestChildGuard: CanActivateChildFn = () => {
  return isGuest();
};
