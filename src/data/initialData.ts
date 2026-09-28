import { Product, Claim } from '../types';

// Default starter products so all customers see live products on any new browser/device
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Wireless Bluetooth Noise Cancelling Earbuds',
    platform: 'Amazon',
    code: 'AMZ-EAR-250',
    cashbackAmount: 250,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    link: 'https://www.amazon.in',
    description: 'High-fidelity audio with deep bass and ENC microphone. 100% genuine verified offer.',
    createdAt: '2026-09-27',
    isActive: true
  },
  {
    id: 2,
    title: 'Smart AMOLED Fitness Tracker Watch',
    platform: 'Flipkart',
    code: 'FLP-WAT-350',
    cashbackAmount: 350,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    link: 'https://www.flipkart.com',
    description: 'Full-touch AMOLED display, heart rate monitor, sleep tracking with IP68 water resistance.',
    createdAt: '2026-09-27',
    isActive: true
  },
  {
    id: 3,
    title: 'Premium Cold-Pressed Extra Virgin Olive Oil 500ml',
    platform: 'Blinkit',
    code: 'BLK-OIL-150',
    cashbackAmount: 150,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    link: 'https://blinkit.com',
    description: '100% natural cold pressed extra virgin olive oil. Superfast 10-minute delivery cashback offer.',
    createdAt: '2026-09-27',
    isActive: true
  }
];

export const INITIAL_CLAIMS: Claim[] = [];

export const STORAGE_KEYS = {
  PRODUCTS: 'wms_products_live_v1',
  CLAIMS: 'wms_claims_live_v1',
  USER: 'wms_user_live_v1'
};
