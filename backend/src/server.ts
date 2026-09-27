import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { checkAndExpireReservations } from './utils/reservationExpiry';

// Import Route Handlers
import authRoutes from './routes/authRoutes';
import storeRoutes from './routes/storeRoutes';
import productRoutes from './routes/productRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import reservationRoutes from './routes/reservationRoutes';
import orderRoutes from './routes/orderRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

// Production & Development CORS Configuration
const allowedOrigins: string[] = [
  'https://nearstyle-frontend.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.onrender.com') ||
        (process.env.NODE_ENV !== 'production' &&
          (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')))
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked]: Origin "${origin}" is not permitted.`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (Render Zero-Downtime & Monitoring)
app.get('/api/health', (_req, res) => {
  const dbStatus = isDbConnected() ? 'connected' : 'connecting';
  res.status(200).json({
    status: 'ok',
    service: 'NearStyle API',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Root informational endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'NearStyle API',
    tagline: 'Discover Nearby. Try Before You Buy.',
    health: '/api/health',
    status: 'active',
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server and initialize database connection
const startServer = async () => {
  try {
    app.listen(PORT, HOST, () => {
      console.log(`🚀 NearStyle Backend API running on http://${HOST}:${PORT}`);
      console.log(`📡 Health check active at: http://${HOST}:${PORT}/api/health`);
    });

    // Asynchronously connect to MongoDB (won't crash process if DB takes a moment)
    connectDB().catch((err) => {
      console.warn('Initial database connection deferred:', err.message);
    });

    // Run Reserve & Try expiry cleaner periodically every 60 seconds
    setInterval(async () => {
      try {
        if (isDbConnected()) {
          await checkAndExpireReservations();
        }
      } catch (err: any) {
        console.error('Background reservation check error:', err.message);
      }
    }, 60 * 1000);
  } catch (error: any) {
    console.error('Fatal: failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
