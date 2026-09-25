import mongoose, { Document, Schema } from 'mongoose';

export type StoreStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface IStoreLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IStore extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  area: string;
  location: IStoreLocation;
  openingTime: string;
  closingTime: string;
  categories: string[];
  image: string;
  rating: number;
  reviewCount: number;
  status: StoreStatus;
  allowsReservation: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Please provide store phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please provide store email'],
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide full store address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please provide area or neighborhood'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [72.8777, 19.0760], // default Mumbai coordinates
      },
    },
    openingTime: {
      type: String,
      default: '10:00 AM',
    },
    closingTime: {
      type: String,
      default: '09:00 PM',
    },
    categories: {
      type: [String],
      default: ['Men', 'Women', 'Casual'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'APPROVED',
    },
    allowsReservation: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

StoreSchema.index({ 'location': '2dsphere' });
StoreSchema.index({ city: 1, area: 1 });

export const Store = mongoose.model<IStore>('Store', StoreSchema);
