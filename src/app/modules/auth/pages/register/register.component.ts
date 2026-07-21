import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { RegisterRequest } from '../../models/register-request';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm!: FormGroup;

  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initializeForm();
  }

  // Initialize Register Form

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],

      phoneNumber: ['', Validators.required],

      shippingAddress: ['', Validators.required],

      password: ['', [Validators.required, Validators.minLength(6)]],

      confirmPassword: ['', Validators.required],
    });
  }

  // ==========================================
  // Register
  // ==========================================

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      return;
    }

    const request: RegisterRequest = this.registerForm.value;

    this.isSubmitting = true;

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        // Verify API Response
        if (response.statusCode !== 201) {
          this.authService.showMessage(response.message);
          return;
        }

        // Display Success Message
        this.authService.showMessage(response.message);

        // Redirect to Login
        this.router.navigate(['/auth/login']);
      },

      error: (error) => {
        this.isSubmitting = false;

        this.authService.showMessage('Registration Failed.');
      },
    });
  }
}
