import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Order } from 'src/app/modules/orders/models/order';
import { MonthlySalesSummary } from '../../models/monthly-sales-summary';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];

  totalOrders = 0;

  salesSummary: MonthlySalesSummary[] = [];

  isLoadingOrders = false;

  isLoadingSales = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadSalesSummary();
  }

  loadOrders(): void {
    this.isLoadingOrders = true;

    this.adminService.getOrders(0, 5).subscribe({
      next: (response) => {
        this.isLoadingOrders = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.orders = response.data.items;
        this.totalOrders = response.data.totalRows;
      },
      error: () => {
        this.isLoadingOrders = false;
          this.authService.showMessage('Unable to load admin orders.');
      },
    });
  }

  loadSalesSummary(): void {
    this.isLoadingSales = true;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    this.adminService.getSalesSummary(startDate, endDate).subscribe({
      next: (response) => {
        this.isLoadingSales = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.salesSummary = response.data;
      },
      error: () => {
        this.isLoadingSales = false;
        this.authService.showMessage('Unable to load sales summary.');
      },
    });
  }

  totalSales(): number {
    return this.salesSummary.reduce(
      (total, month) => total + month.totalSales,
      0,
    );
  }

  pendingOrders(): number {
    return this.orders.filter((order) => order.status === 'Pending').length;
  }

  completedOrders(): number {
    return this.orders.filter((order) => order.status === 'Completed').length;
  }

}
