import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Store } from '../models/Store';

// Helper to generate JWT
const generateToken = (user: IUser, storeId?: string): string => {
  const secret = process.env.JWT_SECRET || 'nearstyle_jwt_default_secret';
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      storeId: storeId || user.storeId?.toString(),
    },
    secret,
    { expiresIn: '7d' }
  );
};

// @desc Customer Registration
// @route POST /api/auth/customer/register
export const registerCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'CUSTOMER',
      phone: phone || '',
      address: address || {},
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Customer Login
// @route POST /api/auth/customer/login
export const loginCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'CUSTOMER' });
    if (!user) {
      res.status(401).json({ message: 'Invalid customer email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid customer email or password.' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Shopkeeper Registration (Creates User + Store)
// @route POST /api/auth/shopkeeper/register
export const registerShopkeeper = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      storeName,
      address,
      city,
      area,
      openingTime,
      closingTime,
      categories,
      image,
    } = req.body;

    if (!name || !email || !password || !storeName || !address || !city || !area) {
      res.status(400).json({
        message: 'Owner name, email, password, store name, address, city, and area are required.',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Shopkeeper User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'SHOPKEEPER',
      phone: phone || '',
    });

    // Create Associated Store (Starts as PENDING or APPROVED depending on demo environment)
    const store = await Store.create({
      name: storeName,
      ownerId: user._id,
      phone: phone || '',
      email: email.toLowerCase(),
      address,
      city,
      area,
      openingTime: openingTime || '10:00 AM',
      closingTime: closingTime || '09:00 PM',
      categories: categories || ['Men', 'Women', 'Casual'],
      image: image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      status: 'APPROVED', // Pre-approve for seamless testing
    });

    // Link store to user
    user.storeId = store._id as any;
    await user.save();

    const token = generateToken(user, store._id.toString());

    res.status(201).json({
      message: 'Shopkeeper account and store created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: store._id,
      },
      store: {
        id: store._id,
        name: store.name,
        status: store.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Shopkeeper Login
// @route POST /api/auth/shopkeeper/login
export const loginShopkeeper = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'SHOPKEEPER' });
    if (!user) {
      res.status(401).json({ message: 'Invalid shopkeeper credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid shopkeeper credentials.' });
      return;
    }

    // Find shopkeeper's store
    let store = null;
    if (user.storeId) {
      store = await Store.findById(user.storeId);
    } else {
      store = await Store.findOne({ ownerId: user._id });
      if (store) {
        user.storeId = store._id as any;
        await user.save();
      }
    }

    const token = generateToken(user, store?._id?.toString());

    res.json({
      message: 'Shopkeeper login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: store?._id,
      },
      store,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Login
// @route POST /api/auth/admin/login
export const loginAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'ADMIN' });
    if (!user) {
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Current Logged-in User
// @route GET /api/auth/me
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let store = null;
    if (user.role === 'SHOPKEEPER') {
      store = await Store.findOne({ ownerId: user._id });
    }

    res.json({
      user,
      store,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update Profile
// @route PUT /api/auth/profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address,
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};
