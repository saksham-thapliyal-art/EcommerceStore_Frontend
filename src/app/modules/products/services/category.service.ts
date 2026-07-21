import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/shared/models/api-response';
import { PagedResponse } from 'src/app/shared/models/paged-response';
import { environment } from 'src/environments/environment';

export interface ProductCategory {
  categoryId: number;
  name: string;
  description?: string | null;
  parentCategoryId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/Category`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ApiResponse<PagedResponse<ProductCategory>>> {
    const params = new HttpParams()
      .set('pageIndex', '0')
      .set('pageSize', '200')
      .set('sortBy', 'name')
      .set('sortDirection', 'asc');

    return this.http.get<ApiResponse<PagedResponse<ProductCategory>>>(
      `${this.apiUrl}/GetAllCategories`,
      { params },
    );
  }
}
