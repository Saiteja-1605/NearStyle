import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { Reservation } from '../models/Reservation';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { demoStores, demoProductsRaw } from './demoData';
import { generateOrderNumber, generateReservationCode } from '../utils/codeGenerator';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not set in environment variables.');
    }

    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    // Clear existing collections
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Reservation.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    // Hash demo password
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@123', salt);

    console.log('Creating demo users...');
    // 1. Demo Customer
    const customerUser = await User.create({
      name: 'Aditi Sharma',
      email: 'demo.customer@nearstyle.com',
      password: demoPasswordHash,
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
      address: {
        street: 'Flat 402, Sea Green Apts, Perry Cross Road',
        city: 'Mumbai',
        area: 'Bandra',
        pincode: '400050',
      },
    });

    // 2. Demo Shopkeeper
    const shopkeeperUser = await User.create({
      name: 'Rajesh Mehta',
      email: 'demo.shopkeeper@nearstyle.com',
      password: demoPasswordHash,
      role: 'SHOPKEEPER',
      phone: '+91 98201 12345',
      address: {
        street: 'Shop 14, Linking Road',
        city: 'Mumbai',
        area: 'Bandra',
        pincode: '400050',
      },
    });

    // 3. Demo Admin
    const adminUser = await User.create({
      name: 'NearStyle Admin',
      email: 'demo.admin@nearstyle.com',
      password: demoPasswordHash,
      role: 'ADMIN',
      phone: '+91 90000 00000',
    });

    console.log('Creating demo stores...');
    // Create stores
    const createdStores: any[] = [];
    for (let i = 0; i < demoStores.length; i++) {
      const storeData = demoStores[i];
      // Assign Fashion Hub to demo shopkeeper, others to generated shopkeeper references
      const ownerId = i === 0 ? shopkeeperUser._id : new mongoose.Types.ObjectId();
      const store = await Store.create({
        ...storeData,
        ownerId,
      });
      createdStores.push(store);
    }

    // Link first store to demo shopkeeper
    shopkeeperUser.storeId = createdStores[0]._id;
    await shopkeeperUser.save();

    console.log('Distributing and creating 40+ products across stores...');
    const createdProducts: any[] = [];

    // Distribute products across all stores
    for (let storeIdx = 0; storeIdx < createdStores.length; storeIdx++) {
      const currentStore = createdStores[storeIdx];

      // Assign an assortment of items to each store
      demoProductsRaw.forEach((baseProduct, pIdx) => {
        // Vary stock or pricing slightly to make catalog feel natural
        const priceVariation = ((storeIdx + pIdx) % 3) * 50;
        const discountPrice = Math.max(299, (baseProduct.discountPrice || baseProduct.price) - priceVariation);

        // Only assign appropriate category items or spread across stores
        if (
          (storeIdx === 0) || // Fashion Hub gets full assortment
          (storeIdx === 1 && ['Men', 'Women', 'Accessories'].includes(baseProduct.category)) ||
          (storeIdx === 2 && ['Women', 'Men'].includes(baseProduct.category)) ||
          (storeIdx === 3 && ['Women', 'Accessories'].includes(baseProduct.category)) ||
          (storeIdx === 4 && ['Men', 'Footwear'].includes(baseProduct.category)) ||
          (storeIdx === 5 && ['Kids', 'Men', 'Footwear'].includes(baseProduct.category))
        ) {
          createdProducts.push({
            ...baseProduct,
            name: storeIdx === 0 ? baseProduct.name : `${baseProduct.name} - ${currentStore.area}`,
            storeId: currentStore._id,
            discountPrice,
            isAvailable: true,
            reservationEligible: true,
          });
        }
      });
    }

    const insertedProducts = await Product.insertMany(createdProducts);
    console.log(`Inserted ${insertedProducts.length} products across ${createdStores.length} stores.`);

    // Create 1 Active Sample Reservation for Customer at Fashion Hub
    console.log('Seeding sample active reservation...');
    const sampleProduct = insertedProducts[0];
    const reservedSize = sampleProduct.sizes[0].size;

    // Lock 1 unit
    await Product.updateOne(
      { _id: sampleProduct._id, 'sizes.size': reservedSize },
      { $inc: { 'sizes.$.reserved': 1 } }
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 60 * 60 * 1000 + 42 * 60 * 1000); // 7h 42m remaining

    const sampleRes = await Reservation.create({
      reservationCode: generateReservationCode(),
      customerId: customerUser._id,
      storeId: createdStores[0]._id,
      productId: sampleProduct._id,
      size: reservedSize,
      colour: sampleProduct.colors[0] || 'Black',
      quantity: 1,
      reservedAt: now,
      expiresAt,
      status: 'ACTIVE',
    });

    // Create 1 Sample Order for Customer
    console.log('Seeding sample delivered order...');
    const orderNumber = generateOrderNumber();
    const orderedProduct = insertedProducts[1];
    const orderItem = {
      productId: orderedProduct._id,
      name: orderedProduct.name,
      image: orderedProduct.images[0],
      size: orderedProduct.sizes[0].size,
      colour: orderedProduct.colors[0],
      price: orderedProduct.discountPrice || orderedProduct.price,
      quantity: 1,
    };

    await Order.create({
      orderNumber,
      customerId: customerUser._id,
      storeId: createdStores[0]._id,
      items: [orderItem],
      subtotal: orderItem.price,
      deliveryFee: 0,
      totalAmount: orderItem.price,
      shippingAddress: {
        fullName: customerUser.name,
        phone: customerUser.phone || '+91 98765 43210',
        street: customerUser.address?.street || 'Flat 402, Sea Green Apts, Perry Cross Road',
        city: customerUser.address?.city || 'Mumbai',
        area: customerUser.address?.area || 'Bandra',
        pincode: customerUser.address?.pincode || '400050',
      },
      orderType: 'STORE_PICKUP',
      paymentMethod: 'DEMO_PAYMENT',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
    });

    // Create Sample Reviews
    await Review.create({
      productId: sampleProduct._id,
      customerId: customerUser._id,
      customerName: customerUser.name,
      rating: 5,
      comment: 'Tried this at Fashion Hub with Reserve & Try! Loved the fabric and fit. Bought it on the spot.',
    });

    // Seed Sample Notification
    await Notification.create({
      userId: customerUser._id,
      title: 'Active Reservation Reminder',
      message: `Your reservation (${sampleRes.reservationCode}) for ${sampleProduct.name} at Fashion Hub is active. 7h 42m remaining to try it in-store!`,
      type: 'RESERVATION',
      link: '/reservations',
    });

    console.log('----------------------------------------------------');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('1. Customer:   demo.customer@nearstyle.com   / Demo@123');
    console.log('2. Shopkeeper: demo.shopkeeper@nearstyle.com / Demo@123');
    console.log('3. Admin:      demo.admin@nearstyle.com      / Demo@123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  } catch (error: any) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

// Execute if run directly
if (require.main === module) {
  seedDatabase();
}
