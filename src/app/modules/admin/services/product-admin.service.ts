import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/shared/models/api-response';
import { PagedResponse } from 'src/app/shared/models/paged-response';
import { Product } from 'src/app/modules/products/models/product';
import { ProductFilter } from 'src/app/modules/products/models/product-filter';
import { ProductImage } from 'src/app/modules/products/models/product-image';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductAdminService {
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

  create(formData: FormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      `${this.apiUrl}/CreateProduct`,
      formData,
    );
  }

  update(
    productId: number,
    formData: FormData,
  ): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(
      `${this.apiUrl}/UpdateProduct/${productId}`,
      formData,
    );
  }

  delete(productId: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/DeleteProduct/${productId}`,
    );
  }

  getImages(productId: number): Observable<ApiResponse<ProductImage[]>> {
    return this.http.get<ApiResponse<ProductImage[]>>(
      `${this.apiUrl}/GetProductImages/${productId}`,
    );
  }

  updateImages(
    productId: number,
    images: ProductImage[],
  ): Observable<ApiResponse<ProductImage[]>> {
    return this.http.put<ApiResponse<ProductImage[]>>(
      `${this.apiUrl}/UpdateProductImages/${productId}`,
      images.map((image) => ({
        imageId: image.imageId,
        isMain: image.isMain,
        sortOrder: image.sortOrder,
      })),
    );
  }

  deleteImage(
    productId: number,
    imageId: number,
  ): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/DeleteProductImage/${productId}/${imageId}`,
    );
  }
}
