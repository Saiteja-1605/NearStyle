import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'SHOPKEEPER' | 'ADMIN';

export interface IUserAddress {
  street?: string;
  city?: string;
  area?: string;
  pincode?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: IUserAddress;
  storeId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'SHOPKEEPER', 'ADMIN'],
      default: 'CUSTOMER',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      area: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Do not return password by default when serializing
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model<IUser>('User', UserSchema);
