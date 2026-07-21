import { ProductImage } from './product-image';

export interface Product {
  productId: number;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  images: ProductImage[];
}
