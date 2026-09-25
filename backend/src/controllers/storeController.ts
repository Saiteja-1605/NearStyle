import { Request, Response, NextFunction } from 'express';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { calculateDistanceKm } from '../utils/distance';

// @desc Get all approved stores (with distance calculation if coordinates provided)
// @route GET /api/stores
export const getStores = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city, area, search, lat, lng } = req.query;

    const filter: any = { status: 'APPROVED' };

    if (city && city !== 'All') {
      filter.city = { $regex: new RegExp(city as string, 'i') };
    }

    if (area && area !== 'All') {
      filter.area = { $regex: new RegExp(area as string, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [{ name: searchRegex }, { categories: searchRegex }, { area: searchRegex }];
    }

    const stores = await Store.find(filter).lean();

    // Attach calculated distance if user provided lat and lng
    const userLat = lat ? parseFloat(lat as string) : null;
    const userLng = lng ? parseFloat(lng as string) : null;

    const enrichedStores = stores.map((store) => {
      let distanceKm: number | null = null;
      if (
        userLat !== null &&
        userLng !== null &&
        !isNaN(userLat) &&
        !isNaN(userLng) &&
        store.location?.coordinates?.length === 2
      ) {
        const [storeLng, storeLat] = store.location.coordinates;
        distanceKm = calculateDistanceKm(userLat, userLng, storeLat, storeLng);
      }

      return {
        ...store,
        distanceKm,
      };
    });

    // If distance calculated, sort by nearest first
    if (userLat !== null && userLng !== null) {
      enrichedStores.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    res.json(enrichedStores);
  } catch (error) {
    next(error);
  }
};

// @desc Get single store details by ID (including its available products)
// @route GET /api/stores/:id
export const getStoreById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }

    // Get active products for this store
    const products = await Product.find({
      storeId: store._id,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    res.json({
      store,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current shopkeeper's store
// @route GET /api/stores/my-store
export const getMyStore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'No store registered for this shopkeeper account.' });
      return;
    }

    res.json(store);
  } catch (error) {
    next(error);
  }
};

// @desc Update store details (Shopkeeper)
// @route PUT /api/stores/my-store
export const updateMyStore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }

    const {
      name,
      description,
      phone,
      address,
      city,
      area,
      openingTime,
      closingTime,
      categories,
      image,
      allowsReservation,
    } = req.body;

    if (name) store.name = name;
    if (description !== undefined) store.description = description;
    if (phone) store.phone = phone;
    if (address) store.address = address;
    if (city) store.city = city;
    if (area) store.area = area;
    if (openingTime) store.openingTime = openingTime;
    if (closingTime) store.closingTime = closingTime;
    if (categories) store.categories = categories;
    if (image) store.image = image;
    if (allowsReservation !== undefined) store.allowsReservation = allowsReservation;

    await store.save();

    res.json({
      message: 'Store updated successfully',
      store,
    });
  } catch (error) {
    next(error);
  }
};
