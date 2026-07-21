import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/shared/models/api-response';
import { PagedResponse } from 'src/app/shared/models/paged-response';
import { environment } from 'src/environments/environment';

export interface Category {
  categoryId: number;
  name: string;
  description?: string | null;
  parentCategoryId?: number | null;
}

export interface CategoryRequest {
  name: string;
  description?: string | null;
  parentCategoryId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryAdminService {
  private readonly apiUrl = `${environment.apiUrl}/Category`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ApiResponse<PagedResponse<Category>>> {
    const params = new HttpParams()
      .set('pageIndex', '0')
      .set('pageSize', '50')
      .set('sortBy', 'name')
      .set('sortDirection', 'asc');

    return this.http.get<ApiResponse<PagedResponse<Category>>>(
      `${this.apiUrl}/GetAllCategories`,
      { params },
    );
  }

  create(request: CategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(
      `${this.apiUrl}/CreateCategory`,
      request,
    );
  }

  update(
    categoryId: number,
    request: CategoryRequest,
  ): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(
      `${this.apiUrl}/UpdateCategory/${categoryId}`,
      request,
    );
  }

  delete(categoryId: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/DeleteCategory/${categoryId}`,
    );
  }
}
