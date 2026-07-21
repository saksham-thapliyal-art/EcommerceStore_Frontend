export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stockQuantity: number;
  lastUpdated: string;
}
