import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';

// Check Authentication — only checks whether a token exists.
// Does NOT check expiry or attempt a refresh here; if the token is expired,
// the page will load and the first API call will 401, which the
// AuthInterceptor catches and silently refreshes/retries.
function isAuthenticated(): boolean {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
}

export const authGuard: CanActivateFn = () => {
  return isAuthenticated();
};

export const authChildGuard: CanActivateChildFn = () => {
  return isAuthenticated();
};
