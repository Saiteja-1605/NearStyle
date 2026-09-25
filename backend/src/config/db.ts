import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ [DATABASE ERROR]: MONGO_URI is not defined in environment variables.');
    console.error('👉 Please configure MONGO_URI in your .env file or Render environment variables.');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: MONGO_URI must be provided in production.');
    }
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error: any) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: Unable to connect to MongoDB in production environment.');
    }
    return false;
  }
};
