import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Product } from 'src/app/modules/products/models/product';
import {
  Category,
  CategoryAdminService,
} from '../../services/category-admin.service';
import { ProductAdminService } from '../../services/product-admin.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  @ViewChild('categoryDialog') categoryDialog?: TemplateRef<unknown>;

  categories: Category[] = [];

  products: Product[] = [];

  categoryForm!: FormGroup;

  editingCategoryId: number | null = null;

  isLoading = false;

  displayedColumns = ['name', 'description', 'parent', 'actions'];

  private categoryDialogRef?: MatDialogRef<unknown>;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryAdminService,
    private productService: ProductAdminService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      parentCategoryId: [null],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.isLoading = true;

    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.statusCode !== 200 || !response.data) {
          this.authService.showMessage(response.message);
          return;
        }

        this.categories = response.data.items;
      },
      error: () => {
        this.isLoading = false;
        this.authService.showMessage('Unable to load categories.');
      },
    });
  }

  loadProducts(): void {
    this.productService
      .getProducts({
        pageIndex: 0,
        pageSize: 500,
        sortBy: 'name',
        sortDirection: 'asc',
        isActive: true,
      })
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200 && response.data) {
            this.products = response.data.items;
          }
        },
      });
  }

  openCreateDialog(): void {
    this.resetForm();
    this.openCategoryDialog();
  }

  openEditDialog(category: Category): void {
    this.editCategory(category);
    this.openCategoryDialog();
  }

  openCategoryDialog(): void {
    if (!this.categoryDialog) {
      return;
    }

    this.categoryDialogRef = this.dialog.open(this.categoryDialog, {
      width: 'min(520px, calc(100vw - 32px))',
      autoFocus: false,
    });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const request = {
      ...this.categoryForm.value,
      parentCategoryId: this.categoryForm.value.parentCategoryId || null,
    };

    const save$ = this.editingCategoryId
      ? this.categoryService.update(this.editingCategoryId, request)
      : this.categoryService.create(request);

    save$.subscribe({
      next: (response) => {
        this.authService.showMessage(response.message);
        this.resetForm();
        this.categoryDialogRef?.close();
        this.loadCategories();
      },
      error: (error) => {
        this.authService.showMessage(
          error?.error?.message ?? 'Unable to save category.',
        );
      },
    });
  }

  editCategory(category: Category): void {
    this.editingCategoryId = category.categoryId;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      parentCategoryId: category.parentCategoryId ?? null,
    });
  }

  deleteCategory(category: Category): void {
    const shouldDelete = window.confirm(
      `Delete category "${category.name}"? This action cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    this.categoryService.delete(category.categoryId).subscribe({
      next: (response) => {
        this.authService.showMessage(response.message);
        this.loadCategories();
      },
      error: (error) => {
        this.authService.showMessage(
          error?.error?.message ?? 'Unable to delete category.',
        );
      },
    });
  }

  resetForm(): void {
    this.editingCategoryId = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      parentCategoryId: null,
    });
  }

  parentCategories(): Category[] {
    return this.categories.filter(category => !category.parentCategoryId);
  }

  childCategories(parentCategoryId: number): Category[] {
    return this.categories.filter(
      category => category.parentCategoryId === parentCategoryId,
    );
  }

  categoryIcon(category: Category): string {
    const name = category.name.toLowerCase();

    if (name.includes('mobile') || name.includes('phone')) {
      return 'smartphone';
    }

    if (name.includes('laptop') || name.includes('computer')) {
      return 'laptop_mac';
    }

    if (name.includes('fashion') || name.includes('clothing')) {
      return 'checkroom';
    }

    if (name.includes('electronic')) {
      return 'devices';
    }

    return 'category';
  }

  categoryItemCount(category: Category): number {
    const categoryIds = this.categoryAndDescendantIds(category.categoryId);

    return this.products.filter(product =>
      categoryIds.has(product.categoryId),
    ).length;
  }

  parentName(category: Category): string | null {
    if (!category.parentCategoryId) {
      return null;
    }

    return this.categories.find(
      parent => parent.categoryId === category.parentCategoryId,
    )?.name ?? null;
  }

  trackByCategoryId(_: number, category: Category): number {
    return category.categoryId;
  }

  private categoryAndDescendantIds(categoryId: number): Set<number> {
    const ids = new Set<number>();
    const pending = [categoryId];

    while (pending.length) {
      const currentId = pending.shift()!;

      if (ids.has(currentId)) {
        continue;
      }

      ids.add(currentId);

      this.categories
        .filter(category => category.parentCategoryId === currentId)
        .forEach(category => pending.push(category.categoryId));
    }

    return ids;
  }
}
