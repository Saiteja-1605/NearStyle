import mongoose, { Document, Schema } from 'mongoose';

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
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  size: string;
  colour: string;
  price: number;
  quantity: number;
}

export interface IShippingAddress {
  fullName: string;
  street: string;
  city: string;
  area: string;
  pincode: string;
  phone: string;
}

export interface IReturnDetails {
  reason: string;
  requestedAt: Date;
  status: 'REQUESTED' | 'APPROVED' | 'PICKUP_PENDING' | 'RETURNED' | 'REJECTED';
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  returnDetails?: IReturnDetails;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    colour: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    orderType: {
      type: String,
      enum: ['HOME_DELIVERY', 'STORE_PICKUP'],
      default: 'HOME_DELIVERY',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'DEMO_PAYMENT'],
      default: 'DEMO_PAYMENT',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PAID',
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURN_REQUESTED',
        'RETURNED',
      ],
      default: 'PLACED',
      index: true,
    },
    returnDetails: {
      reason: { type: String },
      requestedAt: { type: Date },
      status: {
        type: String,
        enum: ['REQUESTED', 'APPROVED', 'PICKUP_PENDING', 'RETURNED', 'REJECTED'],
        default: 'REQUESTED',
      },
      notes: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
