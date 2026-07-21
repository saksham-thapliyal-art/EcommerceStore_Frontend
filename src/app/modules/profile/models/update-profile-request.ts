export interface UpdateProfileRequest {
  fullName: string;
  shippingAddress?: string | null;
  phoneNumber?: string | null;
}
