import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import * as signalR from '@microsoft/signalr';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Order } from 'src/app/modules/orders/models/order';
import { orderStatusOptions } from 'src/app/shared/constants/catalog-status';
import { environment } from 'src/environments/environment';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];

  statuses = [...orderStatusOptions];

  selectedStatus = 'All';

  startDate: Date | null = null;

  endDate: Date | null = null;

  isLoading = false;

  isPageLoading = false;

  updatingOrderId: number | null = null;

  pageIndex = 0;

  pageSize = 5;

  totalRows = 0;

  displayedColumns = [
    'orderId',
    'customer',
    'date',
    'status',
    'total',
    'payment',
    'actions',
  ];

  private hubConnection?: signalR.HubConnection;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.connectOrderHub();
  }

  ngOnDestroy(): void {
    this.hubConnection?.stop();
  }

  loadOrders(): void {
    this.isLoading = !this.orders.length;
    this.isPageLoading = !!this.orders.length;

    this.adminService
      .getOrders(
        this.pageIndex,
        this.pageSize,
        this.selectedStatus,
        this.formatDate(this.startDate),
        this.formatDate(this.endDate),
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isPageLoading = false;

          if (response.statusCode !== 200 || !response.data) {
            this.authService.showMessage(response.message);
            return;
          }

          this.orders = response.data.items;
          this.totalRows = response.data.totalRows;
        },
        error: () => {
          this.isLoading = false;
          this.isPageLoading = false;
          this.authService.showMessage('Unable to load admin orders.');
        },
      });
  }

  updateStatus(order: Order, status: string): void {
    if (order.status === status) {
      return;
    }

    this.updatingOrderId = order.orderId;

    this.adminService.updateOrderStatus(order.orderId, { status }).subscribe({
      next: (response) => {
        this.updatingOrderId = null;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.orders = this.orders.map((existingOrder) =>
          existingOrder.orderId === order.orderId ? response.data! : existingOrder,
        );

        this.authService.showMessage(response.message);
      },
      error: () => {
        this.updatingOrderId = null;
        this.authService.showMessage('Unable to update order status.');
      },
    });
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  resetPaging(): void {
    this.pageIndex = 0;
    this.loadOrders();
  }

  trackByOrderId(_: number, order: Order): number {
    return order.orderId;
  }

  private connectOrderHub(): void {
    const token = this.authService.getToken();

    if (!token) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.assetUrl}/hubs/orders`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('NewOrder', () => {
      this.authService.showMessage('New order received.');
      this.loadOrders();
    });

    this.hubConnection.start().catch(() => {
      this.authService.showMessage('Live order updates are unavailable.');
    });
  }

  private formatDate(date: Date | null): string | undefined {
    return date ? date.toISOString() : undefined;
  }
}
