export type MerchantPlatform = 'Amazon' | 'Flipkart' | 'Blinkit' | 'Myntra' | 'Other';

export interface Product {
  id: string | number;
  title: string;
  platform: MerchantPlatform;
  image: string;
  link: string;
  code: string; // Special verification code
  cashbackAmount?: number;
  price?: number;
  description?: string;
  createdAt: string;
  isActive?: boolean; // Active / Inactive toggle
}

export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Claim {
  id: string | number;
  productId: string | number;
  productTitle: string;
  platform: MerchantPlatform;
  systemCode: string;
  specialCode: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  orderImgData: string;
  paymentImgData: string;
  ratingImgData: string;
  upiId: string;
  status: ClaimStatus;
  submittedAt: string;
  cashbackAmount?: number;
  adminNote?: string;
  processedAt?: string;
}

export interface User {
  name: string;
  mobile: string;
  email: string;
  type: 'customer' | 'admin';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
