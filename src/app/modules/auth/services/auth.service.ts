import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    const user = this.getCurrentUser();

    if (!user) {
      return false;
    }

    return user.exp * 1000 > Date.now();
  }

  // Logout

  logout(): void {
    localStorage.removeItem('token');

    this.showMessage('Logout Successful.');

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
