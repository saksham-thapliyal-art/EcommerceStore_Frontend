import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { CustomerLayoutComponent } from './core/layout/customer-layout/customer-layout.component';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout.component';
import { authChildGuard, authGuard } from './core/guards/auth.guard';
import { guestChildGuard, guestGuard } from './core/guards/guest.guard';
import { adminChildGuard, adminGuard } from './core/guards/admin.guard';

const routes: Routes = [

  // Authentication
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    canActivateChild: [guestChildGuard],
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },

  // Customer Area
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./modules/products/products.module').then((m) => m.ProductsModule),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        canActivateChild: [authChildGuard],
        loadChildren: () =>
          import('./modules/cart/cart.module').then((m) => m.CartModule),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        canActivateChild: [authChildGuard],
        loadChildren: () =>
          import('./modules/checkout/checkout.module').then((m) => m.CheckoutModule),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        canActivateChild: [authChildGuard],
        loadChildren: () =>
          import('./modules/orders/orders.module').then((m) => m.OrdersModule),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        canActivateChild: [authChildGuard],
        loadChildren: () =>
          import('./modules/profile/profile.module').then((m) => m.ProfileModule),
      },
    ],
  },

  // Admin Area
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminChildGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/admin/admin.module').then((m) => m.AdminModule),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
