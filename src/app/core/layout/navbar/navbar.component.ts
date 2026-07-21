import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { CartService } from 'src/app/modules/cart/services/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  itemCount$: Observable<number> = this.cartService.itemCount$;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.cartService.hydrate().subscribe();
    }
  }

  logout(): void {
    this.cartService.reset();
    this.authService.logout();
  }

}
