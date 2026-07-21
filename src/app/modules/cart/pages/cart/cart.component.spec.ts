import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CartComponent } from './cart.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: jasmine.SpyObj<CartService>;

  beforeEach(() => {
    cartService = jasmine.createSpyObj<CartService>(
      'CartService',
      ['hydrate', 'updateItem', 'removeItem', 'clearCart'],
      {
        cart$: of({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        }),
      },
    );

    TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [SharedModule, RouterTestingModule],
      providers: [
        {
          provide: CartService,
          useValue: cartService,
        },
        {
          provide: AuthService,
          useValue: {
            showMessage: jasmine.createSpy('showMessage'),
          },
        },
      ],
    });

    cartService.hydrate.and.returnValue(
      of({
        data: {
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
        message: 'Loaded.',
        statusCode: 200,
      }),
    );

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hydrates cart on init', () => {
    expect(cartService.hydrate).toHaveBeenCalled();
  });
});
