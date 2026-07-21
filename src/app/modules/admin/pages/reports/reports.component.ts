import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { MonthlySalesSummary } from '../../models/monthly-sales-summary';
import { SalesByCategory } from '../../models/sales-by-category';
import { AdminService } from '../../services/admin.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('monthlySalesChart') monthlySalesChart?: ElementRef<HTMLCanvasElement>;

  @ViewChild('categorySalesChart') categorySalesChart?: ElementRef<HTMLCanvasElement>;

  salesSummary: MonthlySalesSummary[] = [];

  salesByCategory: SalesByCategory[] = [];

  isLoading = false;

  private monthlyChart?: Chart;

  private categoryChart?: Chart;

  private viewReady = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderCharts();
  }

  ngOnDestroy(): void {
    this.monthlyChart?.destroy();
    this.categoryChart?.destroy();
  }

  loadReports(): void {
    this.isLoading = true;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    this.adminService.getSalesSummary(startDate, endDate).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.salesSummary = response.data;
        setTimeout(() => this.renderMonthlyChart());
      },
      error: () => {
        this.isLoading = false;
        this.authService.showMessage('Unable to load sales summary.');
      },
    });

    this.adminService.getSalesByCategory().subscribe({
      next: (response) => {
        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.salesByCategory = response.data;
        setTimeout(() => this.renderCategoryChart());
      },
      error: () => {
        this.authService.showMessage('Unable to load sales by category.');
      },
    });
  }

  totalSales(): number {
    return this.salesSummary.reduce(
      (total, month) => total + month.totalSales,
      0,
    );
  }

  private renderCharts(): void {
    this.renderMonthlyChart();
    this.renderCategoryChart();
  }

  private renderMonthlyChart(): void {
    if (!this.viewReady || !this.monthlySalesChart || !this.salesSummary.length) {
      return;
    }

    this.monthlyChart?.destroy();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.salesSummary.map((month) =>
          new Date(month.salesMonth).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          }),
        ),
        datasets: [
          {
            label: 'Monthly sales',
            data: this.salesSummary.map((month) => month.totalSales),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.14)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    this.monthlyChart = new Chart(this.monthlySalesChart.nativeElement, config);
  }

  private renderCategoryChart(): void {
    if (!this.viewReady || !this.categorySalesChart || !this.salesByCategory.length) {
      return;
    }

    this.categoryChart?.destroy();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.salesByCategory.map((category) => category.categoryName),
        datasets: [
          {
            label: 'Sales by category',
            data: this.salesByCategory.map((category) => category.totalSales),
            backgroundColor: ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    this.categoryChart = new Chart(this.categorySalesChart.nativeElement, config);
  }
}
