import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { environment } from 'src/environments/environment';
import { Cart } from '../models/cart';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const cart: Cart = {
    totalItems: 2,
    totalAmount: 2000,
    items: [
      {
        cartItemId: 1,
        productId: 10,
        productName: 'Test Product',
        imageUrl: null,
        unitPrice: 1000,
        quantity: 2,
        lineTotal: 2000,
        stockQuantity: 5,
        lastUpdated: '2026-07-17T09:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('hydrates cart state from API', () => {
    service.hydrate().subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Cart/GetCart`);
    expect(request.request.method).toBe('GET');
    request.flush({
      data: cart,
      message: 'Cart retrieved successfully.',
      statusCode: 200,
    });

    expect(service.snapshot.totalItems).toBe(2);
  });

  it('adds an item and updates cart state', () => {
    service.addItem({ productId: 10, quantity: 1 }).subscribe();

    const request = httpMock.expectOne(`${environment.apiUrl}/Cart/AddCartItem`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: 10, quantity: 1 });
    request.flush({
      data: cart,
      message: 'Cart updated.',
      statusCode: 200,
    });

    expect(service.snapshot.items.length).toBe(1);
  });

  it('updates quantity through API', () => {
    service.updateItem(1, { quantity: 3 }).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Cart/UpdateCartItem/1`,
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ quantity: 3 });
    request.flush({
      data: { ...cart, totalItems: 3 },
      message: 'Cart updated.',
      statusCode: 200,
    });

    expect(service.snapshot.totalItems).toBe(3);
  });
});
