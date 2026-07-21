import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from 'src/app/shared/models/api-response';
import { PagedResponse } from 'src/app/shared/models/paged-response';
import { Order } from '../models/order';
import { PlaceOrderRequest } from '../models/place-order-request';
import { PlaceOrderResponse } from '../models/place-order-response';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/Order`;

  constructor(private http: HttpClient) {}

  placeOrder(
    request: PlaceOrderRequest,
  ): Observable<ApiResponse<PlaceOrderResponse>> {
    return this.http.post<ApiResponse<PlaceOrderResponse>>(
      `${this.apiUrl}/PlaceOrder`,
      request,
    );
  }

  getHistory(
    pageIndex = 0,
    pageSize = 5,
  ): Observable<ApiResponse<PagedResponse<Order>>> {
    const params = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize));

    return this.http.get<ApiResponse<PagedResponse<Order>>>(
      `${this.apiUrl}/GetOrderHistory`,
      { params },
    );
  }

  getById(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(
      `${this.apiUrl}/GetOrderById/${orderId}`,
    );
  }
}
