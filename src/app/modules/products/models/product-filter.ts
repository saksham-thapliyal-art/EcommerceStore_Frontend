export interface ProductFilter {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: string;
  categoryId?: number;
  minimumPrice?: number;
  maximumPrice?: number;
  isActive?: boolean;
  stockStatus?: string;
}
