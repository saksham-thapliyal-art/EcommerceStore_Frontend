import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';

// Only checks token existence + role. No refresh attempt here — the
// interceptor handles recovering an expired token on the resulting API calls.
function isAdmin(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
}

export const adminGuard: CanActivateFn = () => {
  return isAdmin();
};

export const adminChildGuard: CanActivateChildFn = () => {
  return isAdmin();
};
