import { Injectable } from '@angular/core';

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';

import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  // null while a refresh is pending, a token string on success,
  // the literal string 'FAILED' if the in-flight refresh failed.
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const authorizedRequest = token ? this.addToken(request, token) : request;

    return next.handle(authorizedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isAuthEndpoint(request.url)) {
          return this.handle401(authorizedRequest, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private isAuthEndpoint(url: string): boolean {
    return (
      url.includes('/Auth/Login') ||
      url.includes('/Auth/Register') ||
      url.includes('/Auth/RefreshToken')
    );
  }

  private handle401(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;

          if (response.statusCode !== 200 || !response.data?.token) {
            this.refreshTokenSubject.next('FAILED');
            this.authService.forceLogout();
            return throwError(() => new Error('Refresh token failed.'));
          }

          const newToken = response.data.token;

          this.authService.setSession(newToken);
          this.refreshTokenSubject.next(newToken);

          return next.handle(this.addToken(request, newToken));
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next('FAILED');
          this.authService.forceLogout();
          return throwError(() => refreshError);
        }),
      );
    }

    // A refresh is already in flight — wait for it to resolve one way or the
    // other, instead of firing a redundant second refresh call.
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) =>
        token === 'FAILED'
          ? throwError(() => new Error('Refresh token failed.'))
          : next.handle(this.addToken(request, token as string)),
      ),
    );
  }
}
