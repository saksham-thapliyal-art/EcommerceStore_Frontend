import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { Cart } from '../../models/cart';
import { CartItem } from '../../models/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart$: Observable<Cart> = this.cartService.cart$;

  isLoading = false;

  updatingItemId: number | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;

    this.cartService.hydrate().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.authService.showMessage('Unable to load cart.');
      },
    });
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity >= item.stockQuantity) {
      this.authService.showMessage('No more stock available.');
      return;
    }

    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }

    this.updateQuantity(item, item.quantity - 1);
  }

  removeItem(item: CartItem): void {
    this.updatingItemId = item.cartItemId;

    this.cartService.removeItem(item.cartItemId).subscribe({
      next: (response) => {
        this.updatingItemId = null;
        this.authService.showMessage(response.message);
      },
      error: () => {
        this.updatingItemId = null;
        this.authService.showMessage('Unable to remove item.');
      },
    });
  }

  clearCart(): void {
    this.isLoading = true;

    this.cartService.clearCart().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.showMessage(response.message);
      },
      error: () => {
        this.isLoading = false;
        this.authService.showMessage('Unable to clear cart.');
      },
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  trackByCartItemId(_: number, item: CartItem): number {
    return item.cartItemId;
  }

  formatImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return 'assets/cart-placeholder.svg';
    }

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return `${environment.assetUrl}/${imageUrl}`;
  }

  private updateQuantity(item: CartItem, quantity: number): void {
    this.updatingItemId = item.cartItemId;

    this.cartService
      .updateItem(item.cartItemId, { quantity })
      .subscribe({
        next: (response) => {
          this.updatingItemId = null;

          if (response.statusCode !== 200) {
            this.authService.showMessage(response.message);
          }
        },
        error: () => {
          this.updatingItemId = null;
          this.authService.showMessage('Unable to update quantity.');
        },
      });
  }

}
