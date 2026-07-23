import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../../../environments/environment';

import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';

import { RegisterRequest } from '../models/register-request';
import { RegisterResponse } from '../models/register-response';

import { TokenPayload } from '../models/token-payload';

import { ApiResponse } from 'src/app/shared/models/api-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly appUrl = environment.apiUrl;
  private refreshInProgress$: Observable<ApiResponse<LoginResponse>> | null =
    null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  // Register

  register(
    request: RegisterRequest,
  ): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(
      `${this.appUrl}/Auth/Register`,
      request,
    );
  }

  // Login

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.appUrl}/Auth/Login`,
      request,
      { withCredentials: true },
    );
  }

  // Refresh access token using the HttpOnly refresh cookie
  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    if (!this.refreshInProgress$) {
      this.refreshInProgress$ = this.http
        .post<
          ApiResponse<LoginResponse>
        >(`${this.appUrl}/Auth/RefreshToken`, {}, { withCredentials: true })
        .pipe(
          shareReplay(1),
          finalize(() => {
            this.refreshInProgress$ = null;
          }),
        );
    }

    return this.refreshInProgress$;
  }

  // Server-side logout: revokes the refresh token and clears the HttpOnly cookie
  serverLogout(): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${this.appUrl}/Auth/Logout`,
      {},
      { withCredentials: true },
    );
  }

  // Store JWT

  setSession(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get JWT

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Decode JWT

  getCurrentUser(): TokenPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const decoded: any = jwtDecode(token);

      return {
        userId: Number(
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ],
        ),

        fullName:
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],

        email:
          decoded[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
          ],

        role: decoded[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ],

        exp: decoded.exp,

        iss: decoded.iss,

        aud: decoded.aud,
      };
    } catch {
      return null;
    }
  }

  // Login Status

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAccessTokenExpired(): boolean {
    const user = this.getCurrentUser();

    if (!user) {
      return true;
    }

    return user.exp * 1000 <= Date.now();
  }

  // Logout

  logout(): void {
    this.serverLogout().subscribe({
      error: () => {},
    });

    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
    this.showMessage('Logout Successful.');
  }

  // Called by the interceptor when a refresh attempt fails — the server has
  // already rejected the refresh token, so there's nothing left to revoke;
  // just clean up locally with a message that reflects what happened.
  forceLogout(): void {
    localStorage.removeItem('token');
    this.showMessage('Your session has expired. Please log in again.');
    this.router.navigate(['/auth/login']);
  }

  // Current Role

  getRole(): string | null {
    return this.getCurrentUser()?.role ?? null;
  }

  // Current User Id

  getUserId(): number {
    return this.getCurrentUser()?.userId ?? 0;
  }

  // Current User Name

  getFullName(): string {
    return this.getCurrentUser()?.fullName ?? '';
  }

  // Current User Email

  getEmail(): string {
    return this.getCurrentUser()?.email ?? '';
  }

  // Role Check

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isCustomer(): boolean {
    return this.getRole() === 'Customer';
  }

  // Snackbar
  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
