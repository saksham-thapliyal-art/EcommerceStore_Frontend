import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Product } from 'src/app/modules/products/models/product';
import { ProductImage } from 'src/app/modules/products/models/product-image';
import {
  lowStockThreshold,
  productStatusOptions,
} from 'src/app/shared/constants/catalog-status';
import { environment } from 'src/environments/environment';
import {
  Category,
  CategoryAdminService,
} from '../../services/category-admin.service';
import { ProductAdminService } from '../../services/product-admin.service';

@Component({
  selector: 'app-admin-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  @ViewChild('productDialog') productDialog?: TemplateRef<unknown>;

  readonly lowStockThreshold = lowStockThreshold;

  readonly statusOptions = productStatusOptions;

  products: Product[] = [];

  categories: Category[] = [];

  productForm!: FormGroup;

  selectedFiles: File[] = [];

  selectedFilePreviews: string[] = [];

  selectedMainFileIndex = 0;

  editingImages: ProductImage[] = [];

  editingProductId: number | null = null;

  isLoading = false;

  isPageLoading = false;

  searchTerm = '';

  selectedStatusFilter = 'all';

  pageIndex = 0;

  pageSize = 8;

  totalRows = 0;

  displayedColumns = [
    'thumbnail',
    'name',
    'status',
    'stock',
    'category',
    'price',
    'actions',
  ];

  private productDialogRef?: MatDialogRef<unknown>;

  private categoriesLoaded = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductAdminService,
    private categoryService: CategoryAdminService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      price: [1, [Validators.required, Validators.min(1)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = !this.products.length;
    this.isPageLoading = !!this.products.length;

    this.productService
      .getProducts({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        search: this.searchTerm,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        isActive: this.selectedStatusFilter === 'inactive' ? false : undefined,
        stockStatus: this.selectedStatusFilter,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isPageLoading = false;

          if (response.statusCode !== 200 || !response.data) {
            this.authService.showMessage(response.message);
            return;
          }

          this.products = response.data.items;
          this.totalRows = response.data.totalRows;
        },
        error: () => {
          this.isLoading = false;
          this.isPageLoading = false;
          this.authService.showMessage('Unable to load products.');
        },
      });
  }

  loadCategoriesIfNeeded(): void {
    if (this.categoriesLoaded) {
      return;
    }

    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.statusCode === 200 && response.data) {
          this.categories = response.data.items;
          this.categoriesLoaded = true;
        }
      },
    });
  }

  openCreateDialog(): void {
    this.resetForm();
    this.loadCategoriesIfNeeded();
    this.openProductDialog();
  }

  resetPaging(): void {
    this.pageIndex = 0;
    this.loadProducts();
  }

  pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setSelectedFiles(Array.from(input.files ?? []));
  }

  onDropFiles(event: DragEvent): void {
    event.preventDefault();
    this.setSelectedFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  preventFileDropDefaults(event: DragEvent): void {
    event.preventDefault();
  }

  setSelectedMainFile(index: number): void {
    this.selectedMainFileIndex = index;
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.selectedFilePreviews.splice(index, 1);

    if (this.selectedMainFileIndex >= this.selectedFiles.length) {
      this.selectedMainFileIndex = Math.max(0, this.selectedFiles.length - 1);
    }
  }

  moveSelectedFile(index: number, direction: -1 | 1): void {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= this.selectedFiles.length) {
      return;
    }

    [this.selectedFiles[index], this.selectedFiles[nextIndex]] = [
      this.selectedFiles[nextIndex],
      this.selectedFiles[index],
    ];

    [this.selectedFilePreviews[index], this.selectedFilePreviews[nextIndex]] = [
      this.selectedFilePreviews[nextIndex],
      this.selectedFilePreviews[index],
    ];

    if (this.selectedMainFileIndex === index) {
      this.selectedMainFileIndex = nextIndex;
    } else if (this.selectedMainFileIndex === nextIndex) {
      this.selectedMainFileIndex = index;
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    Object.entries(this.productForm.value).forEach(([key, value]) => {
      formData.append(key, String(value ?? ''));
    });

    this.orderedSelectedFiles().forEach((file) => {
      formData.append('images', file);
    });

    const save$ = this.editingProductId
      ? this.productService.update(this.editingProductId, formData)
      : this.productService.create(formData);

    save$.subscribe({
      next: (response) => {
        this.authService.showMessage(response.message);
        this.resetForm();
        this.productDialogRef?.close();
        this.loadProducts();
      },
      error: (error) => {
        this.authService.showMessage(
          error?.error?.message ?? 'Unable to save product.',
        );
      },
    });
  }

  editProduct(product: Product): void {
    this.editingProductId = product.productId;
    this.selectedFiles = [];
    this.editingImages = [...product.images].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
    });

    this.loadCategoriesIfNeeded();
    this.openProductDialog();
  }

  setMainImage(image: ProductImage): void {
    this.editingImages = this.editingImages.map((existingImage) => ({
      ...existingImage,
      isMain: existingImage.imageId === image.imageId,
    }));
  }

  moveExistingImage(index: number, direction: -1 | 1): void {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= this.editingImages.length) {
      return;
    }

    [this.editingImages[index], this.editingImages[nextIndex]] = [
      this.editingImages[nextIndex],
      this.editingImages[index],
    ];

    this.editingImages = this.editingImages.map((image, imageIndex) => ({
      ...image,
      sortOrder: imageIndex + 1,
    }));
  }

  saveImageMetadata(): void {
    if (!this.editingProductId) {
      return;
    }

    if (this.editingImages.filter((image) => image.isMain).length !== 1) {
      this.authService.showMessage('Select exactly one main image.');
      return;
    }

    this.productService
      .updateImages(this.editingProductId, this.editingImages)
      .subscribe({
        next: (response) => {
          this.authService.showMessage(response.message);
          if (response.data) {
            this.editingImages = response.data;
          }
          this.loadProducts();
        },
        error: (error) => {
          this.authService.showMessage(
            error?.error?.message ?? 'Unable to update images.',
          );
        },
      });
  }

  removeImage(image: ProductImage): void {
    if (!this.editingProductId) {
      return;
    }

    this.productService
      .deleteImage(this.editingProductId, image.imageId)
      .subscribe({
        next: (response) => {
          this.authService.showMessage(response.message);
          this.editingImages = this.editingImages.filter(
            (existingImage) => existingImage.imageId !== image.imageId,
          );
          this.loadProducts();
        },
        error: (error) => {
          this.authService.showMessage(
            error?.error?.message ?? 'Unable to remove image.',
          );
        },
      });
  }

  imageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    return `${environment.assetUrl}/${imageUrl}`;
  }

  mainImageUrl(product: Product): string | null {
    const image =
      product.images.find((productImage) => productImage.isMain) ??
      product.images[0];

    return image ? this.imageUrl(image.imageUrl) : null;
  }

  productStatus(product: Product): { key: string; label: string } {
    if (!product.isActive) {
      return { key: 'inactive', label: 'Inactive' };
    }

    if (product.stockQuantity === 0) {
      return { key: 'soldout', label: 'Sold out' };
    }

    if (product.stockQuantity <= this.lowStockThreshold) {
      return { key: 'low', label: 'Low in stock' };
    }

    return { key: 'active', label: 'Active' };
  }

  deleteProduct(product: Product): void {
    const shouldDelete = window.confirm(
      `Soft-delete product "${product.name}"?`,
    );

    if (!shouldDelete) {
      return;
    }

    this.productService.delete(product.productId).subscribe({
      next: (response) => {
        this.authService.showMessage(response.message);
        this.loadProducts();
      },
      error: (error) => {
        this.authService.showMessage(
          error?.error?.message ?? 'Unable to delete product.',
        );
      },
    });
  }

  resetForm(): void {
    this.editingProductId = null;
    this.selectedFiles = [];
    this.selectedFilePreviews = [];
    this.selectedMainFileIndex = 0;
    this.editingImages = [];
    this.productForm.reset({
      name: '',
      description: '',
      price: 1,
      stockQuantity: 0,
      categoryId: null,
    });
  }

  private setSelectedFiles(files: File[]): void {
    this.selectedFiles = files.filter((file) => file.type.startsWith('image/'));
    this.selectedFilePreviews.forEach((preview) =>
      URL.revokeObjectURL(preview),
    );
    this.selectedFilePreviews = this.selectedFiles.map((file) =>
      URL.createObjectURL(file),
    );
    this.selectedMainFileIndex = 0;
  }

  private orderedSelectedFiles(): File[] {
    if (!this.selectedFiles.length) {
      return [];
    }

    return [
      this.selectedFiles[this.selectedMainFileIndex],
      ...this.selectedFiles.filter(
        (_, index) => index !== this.selectedMainFileIndex,
      ),
    ];
  }

  trackByProductId(_: number, product: Product): number {
    return product.productId;
  }

  private openProductDialog(): void {
    if (!this.productDialog) {
      return;
    }

    this.productDialogRef = this.dialog.open(this.productDialog, {
      width: 'min(820px, calc(100vw - 32px))',
      maxHeight: 'calc(100vh - 48px)',
      autoFocus: false,
    });
  }
}
