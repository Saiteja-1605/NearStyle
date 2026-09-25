export type UserRole = 'CUSTOMER' | 'SHOPKEEPER' | 'ADMIN';

export interface IUserAddress {
  fullName?: string;
  street?: string;
  city?: string;
  area?: string;
  pincode?: string;
  phone?: string;
}

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: IUserAddress;
  storeId?: string;
}

export type StoreStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface IStore {
  _id: string;
  id?: string;
  name: string;
  ownerId?: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  openingTime: string;
  closingTime: string;
  categories: string[];
  image: string;
  rating: number;
  reviewCount: number;
  status: StoreStatus;
  allowsReservation: boolean;
  distanceKm?: number | null;
}

export interface ISizeStock {
  size: string;
  quantity: number;
  reserved: number;
  available?: number;
}

export interface IProduct {
  _id: string;
  id?: string;
  name: string;
  brand: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  discountPrice?: number;
  images: string[];
  colors: string[];
  sizes: ISizeStock[];
  storeId: IStore | string;
  isAvailable: boolean;
  reservationEligible: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
  distanceKm?: number | null;
  totalAvailable?: number;
}

export type ReservationStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface IReservation {
  _id: string;
  reservationCode: string;
  customerId: IUser | string;
  storeId: IStore | string;
  productId: IProduct | string;
  size: string;
  colour: string;
  quantity: number;
  reservedAt: string;
  expiresAt: string;
  status: ReservationStatus;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export type OrderType = 'HOME_DELIVERY' | 'STORE_PICKUP';
export type PaymentMethod = 'COD' | 'DEMO_PAYMENT';
export type PaymentStatus = 'PENDING' | 'PAID';
export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export interface IOrderItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  colour: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  customerId: IUser | string;
  storeId: IStore | string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  shippingAddress: IUserAddress;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  returnDetails?: {
    reason: string;
    requestedAt: string;
    status: 'REQUESTED' | 'APPROVED' | 'PICKUP_PENDING' | 'RETURNED' | 'REJECTED';
    notes?: string;
  };
  createdAt: string;
}

export interface IReview {
  _id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'RESERVATION' | 'RETURN' | 'STORE' | 'SYSTEM';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ICartItem {
  productId: string;
  name: string;
  image: string;
  brand: string;
  size: string;
  colour: string;
  price: number;
  quantity: number;
  storeId: string;
  storeName: string;
  maxAvailable: number;
}
