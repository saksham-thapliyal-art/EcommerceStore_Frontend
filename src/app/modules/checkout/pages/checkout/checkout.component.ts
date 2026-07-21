import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Cart } from 'src/app/modules/cart/models/cart';
import { CartService } from 'src/app/modules/cart/services/cart.service';
import { OrderService } from 'src/app/modules/orders/services/order.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;

  cart$: Observable<Cart> = this.cartService.cart$;

  isLoading = false;

  isSubmitting = false;

  paymentMethods = ['Cash On Delivery', 'Credit Card', 'UPI'];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.cartService.hydrate().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.authService.showMessage('Unable to load checkout summary.');
      },
    });
  }

  placeOrder(cart: Cart): void {
    if (!cart.items.length) {
      this.authService.showMessage('Your cart is empty.');
      this.router.navigate(['/products']);
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.orderService.placeOrder(this.checkoutForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.statusCode !== 201 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.cartService.reset();
        this.authService.showMessage(response.message);
        this.router.navigate(['/orders'], {
          queryParams: {
            placed: response.data.orderId,
          },
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.authService.showMessage(
          error?.error?.message ?? 'Unable to place order.',
        );
      },
    });
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.maxLength(500)]],
      paymentMethod: ['Cash On Delivery', Validators.required],
    });
  }

}
