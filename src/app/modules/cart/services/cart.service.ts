import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from 'src/app/shared/models/api-response';
import { AddCartItemRequest } from '../models/add-cart-item-request';
import { Cart } from '../models/cart';
import { UpdateCartItemRequest } from '../models/update-cart-item-request';

const emptyCart: Cart = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/Cart`;

  private readonly cartSubject = new BehaviorSubject<Cart>(emptyCart);

  readonly cart$ = this.cartSubject.asObservable();

  readonly itemCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  get snapshot(): Cart {
    return this.cartSubject.value;
  }

  hydrate(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(`${this.apiUrl}/GetCart`).pipe(
      tap((response) => {
        if (response.statusCode === 200 && response.data) {
          this.setCart(response.data);
        }
      }),
    );
  }

  addItem(request: AddCartItemRequest): Observable<ApiResponse<Cart>> {
    return this.http
      .post<ApiResponse<Cart>>(`${this.apiUrl}/AddCartItem`, request)
      .pipe(tap((response) => this.updateCartFromResponse(response)));
  }

  updateItem(
    cartItemId: number,
    request: UpdateCartItemRequest,
  ): Observable<ApiResponse<Cart>> {
    return this.http
      .put<ApiResponse<Cart>>(
        `${this.apiUrl}/UpdateCartItem/${cartItemId}`,
        request,
      )
      .pipe(tap((response) => this.updateCartFromResponse(response)));
  }

  removeItem(cartItemId: number): Observable<ApiResponse<object>> {
    return this.http
      .delete<ApiResponse<object>>(
        `${this.apiUrl}/RemoveCartItem/${cartItemId}`,
      )
      .pipe(tap(() => this.removeLocalItem(cartItemId)));
  }

  clearCart(): Observable<ApiResponse<object>> {
    return this.http
      .delete<ApiResponse<object>>(`${this.apiUrl}/ClearCart`)
      .pipe(tap(() => this.setCart(emptyCart)));
  }

  reset(): void {
    this.setCart(emptyCart);
  }

  private updateCartFromResponse(response: ApiResponse<Cart>): void {
    if (response.statusCode >= 200 && response.statusCode < 300 && response.data) {
      this.setCart(response.data);
    }
  }

  private removeLocalItem(cartItemId: number): void {
    const items = this.snapshot.items.filter(
      (item) => item.cartItemId !== cartItemId,
    );

    this.setCart({
      items,
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      totalAmount: items.reduce((total, item) => total + item.lineTotal, 0),
    });
  }

  private setCart(cart: Cart): void {
    this.cartSubject.next(cart);
    this.itemCount$.next(cart.totalItems);
  }
}
