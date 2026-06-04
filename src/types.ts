/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  category: "cakes" | "cupcakes" | "pastries" | "desserts";
  basePrice: number;
  image: string;
  popular: boolean;
  availableSizes?: string[];
  availableFlavors?: string[];
}

export interface OrderItem {
  menuItemId: string;
  title: string;
  quantity: number;
  size: string;
  flavor: string;
  customMessage: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryType: "pickup" | "delivery";
  deliveryAddress?: string;
  deliveryDate: string; // YYYY-MM-DD
  orderNotes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  content: string;
  read: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface AIAssistanceConfig {
  guestCount: number;
  shapes: "round" | "square" | "heart" | "tiered";
  themeColor: string;
  eventDescription: string;
}

export interface AIAssistanceResponse {
  recommendationText: string;
  suggestedTiers: number;
  estimatedSlices: number;
  suggestedSize: string;
  suggestedFlavors: string[];
  suggestedPriceInNaira: number;
  cakeConceptName: string;
}
