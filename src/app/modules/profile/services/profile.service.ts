import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/shared/models/api-response';
import { environment } from 'src/environments/environment';
import { Profile } from '../models/profile';
import { UpdateProfileRequest } from '../models/update-profile-request';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/Profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<Profile>> {
    return this.http.get<ApiResponse<Profile>>(
      `${this.apiUrl}/GetProfile`,
    );
  }

  updateProfile(
    request: UpdateProfileRequest,
  ): Observable<ApiResponse<Profile>> {
    return this.http.put<ApiResponse<Profile>>(
      `${this.apiUrl}/UpdateProfile`,
      request,
    );
  }
}
