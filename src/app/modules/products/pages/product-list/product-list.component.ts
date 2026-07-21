import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { CartService } from 'src/app/modules/cart/services/cart.service';
import { environment } from 'src/environments/environment';
import { Product } from '../../models/product';
import { ProductFilter } from '../../models/product-filter';
import { CategoryService, ProductCategory } from '../../services/category.service';
import { ProductService } from '../../services/product.service';

interface CategoryFilterOption {
  label: string;
  value: number | null;
  depth: number;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  filter: ProductFilter = {
    pageIndex: 0,
    pageSize: 8,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    isActive: true,
  };

  totalRows = 0;

  isLoading = false;

  addingProductId: number | null = null;

  sortOptions = [
    { label: 'Newest', sortBy: 'createdAt', sortDirection: 'desc' },
    { label: 'Price: Low to High', sortBy: 'price', sortDirection: 'asc' },
    { label: 'Price: High to Low', sortBy: 'price', sortDirection: 'desc' },
    { label: 'Name', sortBy: 'name', sortDirection: 'asc' },
  ];

  categories: CategoryFilterOption[] = [
    { label: 'All', value: null, depth: 0 },
  ];

  priceRanges = [
    { label: 'All Prices', minimumPrice: null, maximumPrice: null },
    { label: 'Under INR 10,000', minimumPrice: null, maximumPrice: 10000 },
    { label: 'INR 10,000 - 75,000', minimumPrice: 10000, maximumPrice: 75000 },
    { label: 'Above INR 75,000', minimumPrice: 75000, maximumPrice: null },
  ];

  selectedCategoryId: number | null = null;

  selectedPriceRange = this.priceRanges[0];

  selectedSort = this.sortOptions[0];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.categories = this.buildCategoryOptions(response.data.items);
      },
      error: () => {
        this.categories = [{ label: 'All', value: null, depth: 0 }];
        this.authService.showMessage('Unable to load categories.');
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    this.productService.getProducts(this.filter).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.products = response.data.items;
        this.totalRows = response.data.totalRows;
      },
      error: () => {
        this.isLoading = false;
        this.authService.showMessage('Unable to load products.');
      },
    });
  }

  search(search: string): void {
    this.filter = {
      ...this.filter,
      search,
      pageIndex: 0,
    };

    this.loadProducts();
  }

  changeSort(): void {
    this.filter = {
      ...this.filter,
      sortBy: this.selectedSort.sortBy,
      sortDirection: this.selectedSort.sortDirection,
      pageIndex: 0,
    };

    this.loadProducts();
  }

  applyCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;

    this.filter = {
      ...this.filter,
      categoryId: categoryId ?? undefined,
      pageIndex: 0,
    };

    this.loadProducts();
  }

  applyPriceRange(): void {
    this.filter = {
      ...this.filter,
      minimumPrice: this.selectedPriceRange.minimumPrice ?? undefined,
      maximumPrice: this.selectedPriceRange.maximumPrice ?? undefined,
      pageIndex: 0,
    };

    this.loadProducts();
  }

  clearFilters(searchInput?: HTMLInputElement): void {
    if (searchInput) {
      searchInput.value = '';
    }

    this.selectedCategoryId = null;
    this.selectedPriceRange = this.priceRanges[0];
    this.selectedSort = this.sortOptions[0];

    this.filter = {
      pageIndex: 0,
      pageSize: this.filter.pageSize,
      sortBy: this.selectedSort.sortBy,
      sortDirection: this.selectedSort.sortDirection,
      isActive: true,
    };

    this.loadProducts();
  }

  pageChanged(event: PageEvent): void {
    this.filter = {
      ...this.filter,
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    };

    this.loadProducts();
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.authService.showMessage('Login to add products to cart.');
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

  private buildCategoryOptions(
    categories: ProductCategory[],
  ): CategoryFilterOption[] {
    const options: CategoryFilterOption[] = [
      { label: 'All', value: null, depth: 0 },
    ];

    const childrenByParent = new Map<number | null, ProductCategory[]>();

    categories.forEach((category) => {
      const parentId = category.parentCategoryId ?? null;
      const siblings = childrenByParent.get(parentId) ?? [];

      siblings.push(category);
      childrenByParent.set(parentId, siblings);
    });

    const appendChildren = (parentId: number | null, depth: number): void => {
      const children = (childrenByParent.get(parentId) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      children.forEach((category) => {
        options.push({
          label: category.name,
          value: category.categoryId,
          depth,
        });

        appendChildren(category.categoryId, depth + 1);
      });
    };

    appendChildren(null, 0);

    return options;
  }

}
