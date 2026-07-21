import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';


// Check Authentication
function isAuthenticated(): boolean {
  const authService = inject(AuthService);

  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/auth/login']);

  return false;
}

// Can Activate
export const authGuard: CanActivateFn = () => {
  return isAuthenticated();
};

// Can Activate Child
export const authChildGuard: CanActivateChildFn = () => {
  return isAuthenticated();
};
