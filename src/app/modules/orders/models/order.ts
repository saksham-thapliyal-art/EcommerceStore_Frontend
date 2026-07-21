import { OrderItem } from './order-item';

export interface Order {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  items: OrderItem[];
}
