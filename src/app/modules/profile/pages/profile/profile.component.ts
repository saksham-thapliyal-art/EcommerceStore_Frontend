import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Profile } from '../../models/profile';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;

  profileForm: FormGroup;

  isLoading = false;

  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      shippingAddress: ['', [Validators.minLength(10), Validators.maxLength(500)]],
      phoneNumber: ['', [Validators.pattern(/^[0-9+\-\s]{7,20}$/)]],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;

    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.profile = response.data;
        this.profileForm.patchValue({
          fullName: response.data.fullName,
          shippingAddress: response.data.shippingAddress ?? '',
          phoneNumber: response.data.phoneNumber ?? '',
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.authService.showMessage(
          error?.error?.message ?? 'Unable to load profile.',
        );
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    this.profileService.updateProfile({
      fullName: this.profileForm.value.fullName,
      shippingAddress: this.profileForm.value.shippingAddress || null,
      phoneNumber: this.profileForm.value.phoneNumber || null,
    }).subscribe({
      next: (response) => {
        this.isSaving = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.profile = response.data;
        this.authService.showMessage(response.message);
      },
      error: (error) => {
        this.isSaving = false;
        this.authService.showMessage(
          error?.error?.message ?? 'Unable to update profile.',
        );
      },
    });
  }

}
