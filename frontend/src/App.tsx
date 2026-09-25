import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout & Common
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Customer Pages
import { Home } from './pages/Home';
import { Stores } from './pages/Stores';
import { StoreDetails } from './pages/StoreDetails';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Reservations } from './pages/Reservations';
import { Wishlist } from './pages/Wishlist';
import { Profile } from './pages/Profile';

// Auth Pages
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { CustomerRegister } from './pages/auth/CustomerRegister';
import { ShopkeeperLogin } from './pages/auth/ShopkeeperLogin';
import { ShopkeeperRegister } from './pages/auth/ShopkeeperRegister';
import { AdminLogin } from './pages/auth/AdminLogin';

// Shopkeeper Pages
import { Dashboard } from './pages/shopkeeper/Dashboard';
import { MyStore } from './pages/shopkeeper/MyStore';
import { ShopkeeperProducts } from './pages/shopkeeper/ShopkeeperProducts';
import { AddProduct } from './pages/shopkeeper/AddProduct';
import { EditProduct } from './pages/shopkeeper/EditProduct';
import { Inventory } from './pages/shopkeeper/Inventory';
import { ShopkeeperOrders } from './pages/shopkeeper/ShopkeeperOrders';
import { ShopkeeperReservations } from './pages/shopkeeper/ShopkeeperReservations';
import { Analytics } from './pages/shopkeeper/Analytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStores } from './pages/admin/AdminStores';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminOrders } from './pages/admin/AdminOrders';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <LocationProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <AppLayout>
                  <Routes>
                    {/* Public / Customer Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/stores" element={<Stores />} />
                    <Route path="/stores/:id" element={<StoreDetails />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />

                    {/* Customer Protected */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:id"
                      element={
                        <ProtectedRoute allowedRoles={['CUSTOMER', 'SHOPKEEPER', 'ADMIN']}>
                          <OrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reservations"
                      element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                          <Reservations />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute allowedRoles={['CUSTOMER']}>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Auth Routes */}
                    <Route path="/customer/login" element={<CustomerLogin />} />
                    <Route path="/customer/register" element={<CustomerRegister />} />
                    <Route path="/shopkeeper/login" element={<ShopkeeperLogin />} />
                    <Route path="/shopkeeper/register" element={<ShopkeeperRegister />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Shopkeeper Protected Routes */}
                    <Route
                      path="/shopkeeper/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/my-store"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <MyStore />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/products"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <ShopkeeperProducts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/products/add"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <AddProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/products/edit/:id"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <EditProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/inventory"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <Inventory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/orders"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <ShopkeeperOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/reservations"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <ShopkeeperReservations />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/shopkeeper/analytics"
                      element={
                        <ProtectedRoute allowedRoles={['SHOPKEEPER']}>
                          <Analytics />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Protected Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/stores"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminStores />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminOrders />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LocationProvider>
    </ToastProvider>
  );
};

export default App;
