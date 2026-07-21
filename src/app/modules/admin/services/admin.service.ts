import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/shared/models/api-response';
import { Order } from 'src/app/modules/orders/models/order';
import { PagedResponse } from 'src/app/shared/models/paged-response';
import { environment } from 'src/environments/environment';
import { MonthlySalesSummary } from '../models/monthly-sales-summary';
import { DashboardStats } from '../models/dashboard-stats';
import { SalesByCategory } from '../models/sales-by-category';
import { UpdateOrderStatusRequest } from '../models/update-order-status-request';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/Admin`;

  constructor(private http: HttpClient) {}

  getOrders(
    pageIndex: number,
    pageSize: number,
    status?: string,
    startDate?: string,
    endDate?: string,
  ): Observable<ApiResponse<PagedResponse<Order>>> {
    let params = new HttpParams()
      .set('pageIndex', String(pageIndex))
      .set('pageSize', String(pageSize));

    if (status && status !== 'All') {
      params = params.set('status', status);
    }

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ApiResponse<PagedResponse<Order>>>(
      `${this.apiUrl}/GetAllOrders`,
      { params },
    );
  }

  updateOrderStatus(
    orderId: number,
    request: UpdateOrderStatusRequest,
  ): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(
      `${this.apiUrl}/UpdateOrderStatus/${orderId}`,
      request,
    );
  }

  getSalesSummary(
    startDate: Date,
    endDate: Date,
  ): Observable<ApiResponse<MonthlySalesSummary[]>> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<ApiResponse<MonthlySalesSummary[]>>(
      `${this.apiUrl}/GetSalesSummary`,
      { params },
    );
  }

  getSalesByCategory(): Observable<ApiResponse<SalesByCategory[]>> {
    return this.http.get<ApiResponse<SalesByCategory[]>>(
      `${this.apiUrl}/GetSalesByCategory`,
    );
  }

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(
      `${this.apiUrl}/GetDashboardStats`,
    );
  }
}
