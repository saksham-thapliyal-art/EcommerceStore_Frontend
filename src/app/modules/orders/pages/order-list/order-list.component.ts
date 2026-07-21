import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];

  isLoading = false;

  isPageLoading = false;

  pageIndex = 0;

  pageSize = 5;

  totalRows = 0;

  placedOrderId: number | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const placed = this.route.snapshot.queryParamMap.get('placed');

    this.placedOrderId = placed ? Number(placed) : null;

    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = !this.orders.length;
    this.isPageLoading = !!this.orders.length;

    this.orderService.getHistory(this.pageIndex, this.pageSize).subscribe({
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
        this.authService.showMessage('Unable to load orders.');
      },
    });
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }

  trackByOrderId(_: number, order: Order): number {
    return order.orderId;
  }

}
