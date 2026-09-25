import mongoose, { Document, Schema } from 'mongoose';

export interface ISizeStock {
  size: string; // 'XS', 'S', 'M', 'L', 'XL', 'XXL', etc.
  quantity: number; // Total physical inventory owned by store
  reserved: number; // Units currently locked in active 8h reservations
}

export interface IProduct extends Document {
  name: string;
  brand: string;
  description: string;
  category: string; // 'Men', 'Women', 'Kids', 'Footwear', 'Accessories'
  subcategory: string; // 'Shirts', 'T-Shirts', 'Jeans', 'Dresses', 'Kurtas', etc.
  price: number;
  discountPrice?: number;
  images: string[];
  colors: string[];
  sizes: ISizeStock[];
  storeId: mongoose.Types.ObjectId;
  isAvailable: boolean;
  reservationEligible: boolean;
  rating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const SizeStockSchema = new Schema<ISizeStock>(
  {
    size: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved count cannot be negative'],
    },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide brand name'],
      trim: true,
      default: 'NearStyle Select',
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      trim: true,
    },
    subcategory: {
      type: String,
      required: [true, 'Please specify subcategory'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please specify original price'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      default: function (this: IProduct) {
        return this.price;
      },
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      default: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      ],
    },
    colors: {
      type: [String],
      default: ['Black', 'White'],
    },
    sizes: {
      type: [SizeStockSchema],
      required: true,
      validate: {
        validator: function (v: ISizeStock[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one size specified with inventory.',
      },
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    reservationEligible: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: 'text', brand: 'text', description: 'text', category: 'text' });
ProductSchema.index({ category: 1, subcategory: 1, price: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
