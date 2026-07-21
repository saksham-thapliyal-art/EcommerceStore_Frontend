export interface PagedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}
