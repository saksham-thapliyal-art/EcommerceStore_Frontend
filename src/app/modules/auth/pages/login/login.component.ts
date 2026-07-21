import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/login-request';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  hidePassword = true;

  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {}

  // Initialize Login Form

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ==========================================
  // Login
  // ==========================================

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const request: LoginRequest = this.loginForm.value;

    this.isSubmitting = true;

    this.authService.login(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        // Verify API Response
        if (response.statusCode !== 200) {
          this.authService.showMessage(response.message);
          return;
        }

        // Store JWT Token
        this.authService.setSession(response.data.token);

        // Decode Current User
        const currentUser = this.authService.getCurrentUser();

        if (!currentUser) {
          this.authService.showMessage('Unable to read user information.');
          return;
        }

        // Show Success Message
        this.authService.showMessage(response.message);

        // Redirect Based On User Role
        if (currentUser.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },

      error: (error) => {
        this.isSubmitting = false;

        this.authService.showMessage('Something went wrong.');
      },
    });
  }
}
