import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { CartService } from 'src/app/modules/cart/services/cart.service';
import { Product } from 'src/app/modules/products/models/product';
import { ProductService } from 'src/app/modules/products/services/product.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredProducts: Product[] = [];

  isLoading = true;

  addingProductId: number | null = null;

  readonly categories = [
    { name: 'Mobiles & Tablets', icon: 'smartphone', route: '/products' },
    { name: 'Laptops', icon: 'laptop_mac', route: '/products' },
    { name: 'Fashion', icon: 'checkroom', route: '/products' },
    { name: 'Footwear', icon: 'hiking', route: '/products' },
  ];

  readonly promises = [
    { label: 'Free Shipping', detail: 'On orders above INR 999', icon: 'local_shipping' },
    { label: 'Easy Returns', detail: '30 day return window', icon: 'sync' },
    { label: 'Secure Payment', detail: 'Protected checkout', icon: 'verified_user' },
    { label: '24/7 Support', detail: 'Dedicated assistance', icon: 'support_agent' },
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.productService
      .getProducts({
        pageIndex: 0,
        pageSize: 4,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        isActive: true,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.featuredProducts = response.data?.items ?? [];
        },
        error: () => {
          this.isLoading = false;
          this.authService.showMessage('Unable to load featured products.');
        },
      });
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.authService.showMessage('Login to add products to cart.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.addingProductId = product.productId;

    this.cartService
      .addItem({
        productId: product.productId,
        quantity: 1,
      })
      .subscribe({
        next: (response) => {
          this.addingProductId = null;
          this.authService.showMessage(response.message);
        },
        error: (error) => {
          this.addingProductId = null;
          this.authService.showMessage(
            error?.error?.message ?? 'Unable to add product.',
          );
        },
      });
  }

  imageUrl(product: Product): string {
    const image = product.images?.[0]?.imageUrl;

    if (!image) {
      return 'assets/cart-placeholder.svg';
    }

    if (image.startsWith('http')) {
      return image;
    }

    return `${environment.assetUrl}/${image}`;
  }

  trackByProductId(_: number, product: Product): number {
    return product.productId;
  }

}
