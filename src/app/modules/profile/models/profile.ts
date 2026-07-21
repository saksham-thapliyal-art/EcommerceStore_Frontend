export interface Profile {
  fullName: string;
  email: string;
  shippingAddress?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
}
