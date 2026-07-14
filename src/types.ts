export interface ProductAttribute {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  material: string;
  image: string;
  rating: number;
  ratingCount: number;
  sold: number;
  badge?: "exclusive" | "new" | "sale" | "limited" | "bestseller" | "trending";
  description: string;
  attributes: ProductAttribute[];
}

export interface CartItem {
  id: number;
  quantity: number;
}

export interface Review {
  id: number | string;
  name: string;
  date: string;
  avatar: string;
  rating: number;
  text: string;
  productId?: number; // optionally link to specific product
}

export interface GoldRate {
  "24K": number;
  "22K": number;
  "18K": number;
  Silver: number;
  Platinum: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export interface User {
  name: string;
  email: string;
  picture?: string;
  role: 'user' | 'admin';
}

export interface OrderItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  grandTotal: number;
  status: 'Pending' | 'Customizing' | 'Assayed & Certified' | 'Insured Transit' | 'Delivered';
  createdAt: string;
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';
}
