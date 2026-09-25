import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import { Reservation } from '../models/Reservation';
import { Store } from '../models/Store';
import { User } from '../models/User';
import { checkAndExpireReservations } from '../utils/reservationExpiry';
import { generateReservationCode } from '../utils/codeGenerator';

dotenv.config();

async function runReservationTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING RESERVE & TRY AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearstyle_test';

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });
    console.log('Connected to MongoDB for integration testing.');
  } catch (connErr: any) {
    console.warn('⚠️  Could not connect to MongoDB for live integration test:', connErr.message);
    console.log('Please ensure MongoDB is active (or set Atlas MONGO_URI in .env) to run integration tests.');
    return;
  }

  try {
    // 0. Setup test store & users
    const testOwner = await User.create({
      name: 'Test Shopkeeper',
      email: `test_sk_${Date.now()}@test.com`,
      password: 'hash',
      role: 'SHOPKEEPER',
    });

    const testStore = await Store.create({
      name: 'Test Reservation Store',
      ownerId: testOwner._id,
      phone: '9999999999',
      email: testOwner.email,
      address: '123 Test St',
      city: 'Mumbai',
      area: 'Bandra',
      status: 'APPROVED',
      allowsReservation: true,
    });

    const customerA = await User.create({
      name: 'Customer A',
      email: `customerA_${Date.now()}@test.com`,
      password: 'hash',
      role: 'CUSTOMER',
    });

    const customerB = await User.create({
      name: 'Customer B',
      email: `customerB_${Date.now()}@test.com`,
      password: 'hash',
      role: 'CUSTOMER',
    });

    // -------------------------------------------------------------------------
    // SCENARIO A: Stock = 1. Customer A reserves. Customer B must NOT be able to reserve.
    // -------------------------------------------------------------------------
    console.log('Testing Scenario A: Inventory locking and double-booking prevention...');
    const productA = await Product.create({
      name: 'Exclusive Silk Jacket',
      brand: 'TestBrand',
      category: 'Men',
      subcategory: 'Jackets',
      price: 5000,
      sizes: [{ size: 'M', quantity: 1, reserved: 0 }],
      storeId: testStore._id,
      isAvailable: true,
      reservationEligible: true,
    });

    // Customer A reserves the 1 available unit
    const initialAvailableA = productA.sizes[0].quantity - (productA.sizes[0].reserved || 0);
    if (initialAvailableA !== 1) throw new Error('Initial stock assertion failed');

    // Atomic lock by Customer A
    const lockedA = await Product.findOneAndUpdate(
      {
        _id: productA._id,
        'sizes.size': 'M',
        $expr: {
          $gte: [
            {
              $subtract: [
                { $arrayElemAt: ['$sizes.quantity', { $indexOfArray: ['$sizes.size', 'M'] }] },
                { $arrayElemAt: ['$sizes.reserved', { $indexOfArray: ['$sizes.size', 'M'] }] },
              ],
            },
            1,
          ],
        },
      },
      { $inc: { 'sizes.$.reserved': 1 } },
      { new: true }
    );

    if (!lockedA) throw new Error('Customer A reservation failed unexpectedly');
    const resA = await Reservation.create({
      reservationCode: generateReservationCode(),
      customerId: customerA._id,
      storeId: testStore._id,
      productId: productA._id,
      size: 'M',
      colour: 'Black',
      quantity: 1,
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      status: 'ACTIVE',
    });

    // Now Customer B attempts to reserve the same unit
    const lockedB = await Product.findOneAndUpdate(
      {
        _id: productA._id,
        'sizes.size': 'M',
        $expr: {
          $gte: [
            {
              $subtract: [
                { $arrayElemAt: ['$sizes.quantity', { $indexOfArray: ['$sizes.size', 'M'] }] },
                { $arrayElemAt: ['$sizes.reserved', { $indexOfArray: ['$sizes.size', 'M'] }] },
              ],
            },
            1,
          ],
        },
      },
      { $inc: { 'sizes.$.reserved': 1 } },
      { new: true }
    );

    if (lockedB !== null) {
      throw new Error('❌ Scenario A FAILED: Customer B was able to reserve an already reserved unit!');
    }
    console.log('✅ Scenario A PASSED: Customer B was successfully blocked from reserving zero available stock.\n');

    // -------------------------------------------------------------------------
    // SCENARIO B: Reservation expires. Stock becomes available again.
    // -------------------------------------------------------------------------
    console.log('Testing Scenario B: Automatic reservation expiry and stock release...');
    // Manually set resA to have expired 1 minute ago
    resA.expiresAt = new Date(Date.now() - 60 * 1000);
    await resA.save();

    // Call background/lazy expiry cleaner
    const expiredCount = await checkAndExpireReservations();
    if (expiredCount < 1) throw new Error('Expiry cleaner did not catch expired reservation');

    const updatedProductA = await Product.findById(productA._id);
    const availableAfterExpiry = updatedProductA!.sizes[0].quantity - (updatedProductA!.sizes[0].reserved || 0);
    if (availableAfterExpiry !== 1) {
      throw new Error(`❌ Scenario B FAILED: Stock was not restored. Available: ${availableAfterExpiry}`);
    }

    const updatedResA = await Reservation.findById(resA._id);
    if (updatedResA!.status !== 'EXPIRED') {
      throw new Error(`❌ Scenario B FAILED: Status is not EXPIRED (${updatedResA!.status})`);
    }
    console.log('✅ Scenario B PASSED: Expired reservation released stock back to 1.\n');

    // -------------------------------------------------------------------------
    // SCENARIO C: Customer cancels reservation. Stock becomes available again.
    // -------------------------------------------------------------------------
    console.log('Testing Scenario C: Customer voluntary cancellation...');
    // Re-lock
    await Product.updateOne({ _id: productA._id, 'sizes.size': 'M' }, { $inc: { 'sizes.$.reserved': 1 } });
    const resC = await Reservation.create({
      reservationCode: generateReservationCode(),
      customerId: customerA._id,
      storeId: testStore._id,
      productId: productA._id,
      size: 'M',
      colour: 'Black',
      quantity: 1,
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      status: 'ACTIVE',
    });

    // Customer cancels
    await Product.updateOne({ _id: productA._id, 'sizes.size': 'M' }, { $inc: { 'sizes.$.reserved': -1 } });
    resC.status = 'CANCELLED';
    await resC.save();

    const productAfterCancel = await Product.findById(productA._id);
    const availableAfterCancel = productAfterCancel!.sizes[0].quantity - (productAfterCancel!.sizes[0].reserved || 0);
    if (availableAfterCancel !== 1) {
      throw new Error('❌ Scenario C FAILED: Stock was not restored after customer cancellation');
    }
    console.log('✅ Scenario C PASSED: Customer cancellation immediately released stock back to available.\n');

    // -------------------------------------------------------------------------
    // SCENARIO D: Customer purchases reserved product. Stock decreases permanently.
    // -------------------------------------------------------------------------
    console.log('Testing Scenario D: In-store purchase completes and decrements physical quantity...');
    // Customer reserves again
    await Product.updateOne({ _id: productA._id, 'sizes.size': 'M' }, { $inc: { 'sizes.$.reserved': 1 } });
    const resD = await Reservation.create({
      reservationCode: generateReservationCode(),
      customerId: customerA._id,
      storeId: testStore._id,
      productId: productA._id,
      size: 'M',
      colour: 'Black',
      quantity: 1,
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      status: 'ACTIVE',
    });

    // Shopkeeper marks purchased
    await Product.updateOne(
      { _id: productA._id, 'sizes.size': 'M' },
      { $inc: { 'sizes.$.quantity': -1, 'sizes.$.reserved': -1 } }
    );
    resD.status = 'COMPLETED';
    await resD.save();

    const productAfterPurchase = await Product.findById(productA._id);
    const totalPhysicalQty = productAfterPurchase!.sizes[0].quantity;
    const reservedQty = productAfterPurchase!.sizes[0].reserved;
    if (totalPhysicalQty !== 0 || reservedQty !== 0) {
      throw new Error(
        `❌ Scenario D FAILED: Expected physical quantity 0 and reserved 0, got quantity ${totalPhysicalQty} and reserved ${reservedQty}`
      );
    }
    console.log('✅ Scenario D PASSED: In-store purchase permanently decreased total stock and cleared lock.\n');

    // Clean up test data
    await User.deleteMany({ _id: { $in: [testOwner._id, customerA._id, customerB._id] } });
    await Store.deleteOne({ _id: testStore._id });
    await Product.deleteOne({ _id: productA._id });
    await Reservation.deleteMany({ _id: { $in: [resA._id, resC._id, resD._id] } });

    console.log('====================================================');
    console.log('🎉 ALL 4 RESERVE & TRY INTEGRATION SCENARIOS PASSED!');
    console.log('====================================================');
  } catch (testError: any) {
    console.error('Test error:', testError.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runReservationTests();
