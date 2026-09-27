import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnecting = false;

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('⚠️  [DATABASE WARNING]: MONGO_URI is not set in environment variables.');
    console.warn('👉 Please configure MONGO_URI in your Render Web Service Environment settings.');
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
    isConnecting = false;
    return true;
  } catch (error: any) {
    console.error(`❌ [MongoDB Connection Warning]: ${error.message}`);
    console.log('🔄 Will retry MongoDB connection in 5 seconds...');
    isConnecting = false;
    setTimeout(() => {
      connectDB().catch(() => {});
    }, 5000);
    return false;
  }
};
