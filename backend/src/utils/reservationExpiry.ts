import { Reservation } from '../models/Reservation';
import { Product } from '../models/Product';
import { Notification } from '../models/Notification';

/**
 * Checks for all ACTIVE reservations that have passed their 8-hour expiry deadline,
 * unlocks the reserved inventory on the respective products, updates status to 'EXPIRED',
 * and notifies the customer.
 */
export async function checkAndExpireReservations(): Promise<number> {
  try {
    const now = new Date();
    const expiredReservations = await Reservation.find({
      status: 'ACTIVE',
      expiresAt: { $lte: now },
    });

    if (expiredReservations.length === 0) {
      return 0;
    }

    for (const res of expiredReservations) {
      // 1. Restore product inventory reserved count
      await Product.updateOne(
        {
          _id: res.productId,
          'sizes.size': res.size,
        },
        {
          $inc: { 'sizes.$.reserved': -res.quantity },
        }
      );

      // Make sure reserved count doesn't become negative due to any race condition
      await Product.updateOne(
        {
          _id: res.productId,
          'sizes.size': res.size,
          'sizes.reserved': { $lt: 0 },
        },
        {
          $set: { 'sizes.$.reserved': 0 },
        }
      );

      // 2. Mark reservation as EXPIRED
      res.status = 'EXPIRED';
      await res.save();

      // 3. Notify customer
      try {
        await Notification.create({
          userId: res.customerId,
          title: 'Reservation Expired',
          message: `Your reservation (${res.reservationCode}) for size ${res.size} has expired. The item has been returned to store inventory.`,
          type: 'RESERVATION',
          link: '/reservations',
        });
      } catch (notifErr) {
        // Continue even if notification fails
        console.warn('Could not create notification for expired reservation', notifErr);
      }
    }

    console.log(`[Reserve&Try]: Expired and restored ${expiredReservations.length} reservations.`);
    return expiredReservations.length;
  } catch (error: any) {
    console.error('Error checking and expiring reservations:', error.message);
    return 0;
  }
}
