import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { CartService } from 'src/app/modules/cart/services/cart.service';
import { environment } from 'src/environments/environment';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;

  selectedImage = '';

  quantity = 1;

  isLoading = false;

  isAdding = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));

    if (!productId) {
      this.authService.showMessage('Invalid product.');
      return;
    }

    this.loadProduct(productId);
  }

  loadProduct(productId: number): void {
    this.isLoading = true;

    this.productService.getById(productId).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.product = response.data;
        this.selectedImage = this.imageUrl(response.data.images?.[0]?.imageUrl);
      },
      error: () => {
        this.isLoading = false;
        this.authService.showMessage('Unable to load product.');
      },
    });
  }

  increaseQuantity(): void {
    if (!this.product || this.quantity >= this.product.stockQuantity) {
      return;
    }

    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity <= 1) {
      return;
    }

    this.quantity--;
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.authService.showMessage('Login to add products to cart.');
      return;
    }

    this.isAdding = true;

    this.cartService
      .addItem({
        productId: this.product.productId,
        quantity: this.quantity,
      })
      .subscribe({
        next: (response) => {
          this.isAdding = false;
          this.authService.showMessage(response.message);
        },
        error: (error) => {
          this.isAdding = false;
          this.authService.showMessage(
            error?.error?.message ?? 'Unable to add product.',
          );
        },
      });
  }

  imageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return 'assets/cart-placeholder.svg';
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return `${environment.assetUrl}/${imageUrl}`;
  }

  mainImageUrl(product: Product): string {
    return this.selectedImage || this.imageUrl(product.images[0]?.imageUrl);
  }

}
