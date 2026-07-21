export const lowStockThreshold = 5;

export const productStatusOptions = [
  { value: 'all', label: 'All products' },
  { value: 'active', label: 'Active' },
  { value: 'low', label: 'Low in stock' },
  { value: 'soldout', label: 'Sold out' },
  { value: 'inactive', label: 'Inactive' },
] as const;

export const orderStatusOptions = [
  'All',
  'Pending',
  'Processing',
  'Completed',
  'Cancelled',
] as const;
