import { Injectable } from '@angular/core';

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import { Observable, catchError, throwError } from 'rxjs';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // No Token
    if (!token) {
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleAuthError(error),
        ),
      );
    }

    // Clone Request & Attach JWT
    const clonedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) =>
        this.handleAuthError(error),
      ),
    );
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      localStorage.removeItem('token');
      this.router.navigate(['/auth/login']);
    }

    return throwError(() => error);
  }
}
