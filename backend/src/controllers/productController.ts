import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { calculateDistanceKm } from '../utils/distance';
import { checkAndExpireReservations } from '../utils/reservationExpiry';

// @desc Get products with cross-store search and multi-filtering
// @route GET /api/products
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Lazily clean any expired reservations so inventory is up to date
    await checkAndExpireReservations();

    const {
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      size,
      colour,
      storeId,
      city,
      area,
      lat,
      lng,
      maxDistance,
      availableOnly,
      sort,
    } = req.query;

    const query: any = { isAvailable: true };

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
        { colors: searchRegex },
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (subcategory && subcategory !== 'All') {
      query.subcategory = { $regex: new RegExp(`^${subcategory}$`, 'i') };
    }

    if (colour && colour !== 'All') {
      query.colors = { $regex: new RegExp(colour as string, 'i') };
    }

    if (size && size !== 'All') {
      query['sizes.size'] = (size as string).toUpperCase();
    }

    if (minPrice || maxPrice) {
      query.discountPrice = {};
      if (minPrice) query.discountPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountPrice.$lte = Number(maxPrice);
    }

    if (storeId) {
      query.storeId = storeId;
    }

    let products = await Product.find(query).populate('storeId').lean();

    // Filter by store status - only show products from APPROVED stores
    products = products.filter((p: any) => p.storeId && (p.storeId as any).status === 'APPROVED');

    // Filter by store city or area if specified
    if (city && city !== 'All') {
      products = products.filter(
        (p: any) =>
          p.storeId?.city &&
          p.storeId.city.toLowerCase().includes((city as string).toLowerCase())
      );
    }

    if (area && area !== 'All') {
      products = products.filter(
        (p: any) =>
          p.storeId?.area &&
          p.storeId.area.toLowerCase().includes((area as string).toLowerCase())
      );
    }

    // Distance calculation and filtering
    const userLat = lat ? parseFloat(lat as string) : null;
    const userLng = lng ? parseFloat(lng as string) : null;

    let enriched = products.map((p: any) => {
      let distanceKm: number | null = null;
      const store = p.storeId;
      if (
        userLat !== null &&
        userLng !== null &&
        !isNaN(userLat) &&
        !isNaN(userLng) &&
        store?.location?.coordinates?.length === 2
      ) {
        const [storeLng, storeLat] = store.location.coordinates;
        distanceKm = calculateDistanceKm(userLat, userLng, storeLat, storeLng);
      }

      // Calculate total available stock across all sizes
      const totalAvailable = p.sizes.reduce(
        (acc: number, s: any) => acc + Math.max(0, s.quantity - (s.reserved || 0)),
        0
      );

      return {
        ...p,
        distanceKm,
        totalAvailable,
      };
    });

    if (availableOnly === 'true') {
      enriched = enriched.filter((p) => p.totalAvailable > 0);
    }

    if (maxDistance && userLat !== null && userLng !== null) {
      const maxD = parseFloat(maxDistance as string);
      if (!isNaN(maxD)) {
        enriched = enriched.filter((p) => p.distanceKm !== null && p.distanceKm <= maxD);
      }
    }

    // Sorting
    if (sort === 'price-asc') {
      enriched.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sort === 'price-desc') {
      enriched.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sort === 'rating') {
      enriched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'nearest' && userLat !== null && userLng !== null) {
      enriched.sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else {
      // Default: newest first
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

// @desc Get single product details by ID
// @route GET /api/products/:id
export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await checkAndExpireReservations();

    const { lat, lng } = req.query;
    const product = await Product.findById(req.params.id).populate('storeId').lean();

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const userLat = lat ? parseFloat(lat as string) : null;
    const userLng = lng ? parseFloat(lng as string) : null;

    let distanceKm: number | null = null;
    const store = product.storeId as any;
    if (
      userLat !== null &&
      userLng !== null &&
      !isNaN(userLat) &&
      !isNaN(userLng) &&
      store?.location?.coordinates?.length === 2
    ) {
      const [storeLng, storeLat] = store.location.coordinates;
      distanceKm = calculateDistanceKm(userLat, userLng, storeLat, storeLng);
    }

    // Annotate sizes with available inventory
    const enrichedSizes = product.sizes.map((s: any) => ({
      ...s,
      available: Math.max(0, s.quantity - (s.reserved || 0)),
    }));

    res.json({
      ...product,
      sizes: enrichedSizes,
      distanceKm,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add Product (Shopkeeper)
// @route POST /api/products
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Only shopkeepers can add products.' });
      return;
    }

    let storeId = req.user.storeId;
    if (!storeId) {
      const store = await Store.findOne({ ownerId: req.user.id });
      if (!store) {
        res.status(400).json({ message: 'Please create a store profile first.' });
        return;
      }
      storeId = store._id.toString();
    }

    const {
      name,
      brand,
      description,
      category,
      subcategory,
      price,
      discountPrice,
      images,
      colors,
      sizes,
      reservationEligible,
    } = req.body;

    if (!name || !category || !subcategory || !price || !sizes || sizes.length === 0) {
      res.status(400).json({
        message: 'Product name, category, subcategory, price, and at least one size are required.',
      });
      return;
    }

    const product = await Product.create({
      name,
      brand: brand || 'NearStyle Select',
      description: description || '',
      category,
      subcategory,
      price: Number(price),
      discountPrice: discountPrice !== undefined ? Number(discountPrice) : Number(price),
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      colors: colors && colors.length > 0 ? colors : ['Black'],
      sizes: sizes.map((s: any) => ({
        size: s.size.toUpperCase(),
        quantity: Number(s.quantity) || 0,
        reserved: 0,
      })),
      storeId,
      reservationEligible: reservationEligible !== undefined ? reservationEligible : true,
      isAvailable: true,
    });

    res.status(201).json({
      message: 'Product published successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Product (Shopkeeper)
// @route PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Verify ownership
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store || product.storeId.toString() !== store._id.toString()) {
      res.status(403).json({ message: 'You do not have permission to edit this product.' });
      return;
    }

    const {
      name,
      brand,
      description,
      category,
      subcategory,
      price,
      discountPrice,
      images,
      colors,
      sizes,
      isAvailable,
      reservationEligible,
    } = req.body;

    if (name) product.name = name;
    if (brand) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (images) product.images = images;
    if (colors) product.colors = colors;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (reservationEligible !== undefined) product.reservationEligible = reservationEligible;

    if (sizes && Array.isArray(sizes)) {
      // Preserve existing reserved quantities when updating sizes
      const existingReservedMap = new Map<string, number>();
      product.sizes.forEach((s) => existingReservedMap.set(s.size, s.reserved || 0));

      product.sizes = sizes.map((s: any) => ({
        size: s.size.toUpperCase(),
        quantity: Number(s.quantity) || 0,
        reserved: existingReservedMap.get(s.size.toUpperCase()) || 0,
      })) as any;
    }

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete Product (Shopkeeper)
// @route DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store || product.storeId.toString() !== store._id.toString()) {
      res.status(403).json({ message: 'You do not have permission to delete this product.' });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc Get Shopkeeper Products
// @route GET /api/products/shopkeeper/my-products
export const getMyProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.json([]);
      return;
    }

    const products = await Product.find({ storeId: store._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};
