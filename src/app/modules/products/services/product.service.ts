import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/shared/models/api-response';
import { PagedResponse } from 'src/app/shared/models/paged-response';
import { Product } from '../models/product';
import { ProductFilter } from '../models/product-filter';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/Product`;

  constructor(private http: HttpClient) {}

  getProducts(
    filter: ProductFilter,
  ): Observable<ApiResponse<PagedResponse<Product>>> {
    let params = new HttpParams();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ApiResponse<PagedResponse<Product>>>(
      `${this.apiUrl}/GetAllProducts`,
      { params },
    );
  }

  getById(productId: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(
      `${this.apiUrl}/GetProductById/${productId}`,
    );
  }
}
