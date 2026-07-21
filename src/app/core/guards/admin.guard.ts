import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';

// Check Admin Access
function isAdmin(): boolean {
  const authService = inject(AuthService);

  const router = inject(Router);

  // User is not logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);

    return false;
  }

  // User is Admin
  if (authService.isAdmin()) {
    return true;
  }

  // Logged in but not an Admin
  router.navigate(['/']);

  return false;
}


// Can Activate
export const adminGuard: CanActivateFn = () => {
  return isAdmin();
};

// Can Activate Child
export const adminChildGuard: CanActivateChildFn = () => {
  return isAdmin();
};
