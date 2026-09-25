import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  MapPin,
  Search,
  Heart,
  ShoppingBag,
  Clock,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Store as StoreIcon,
  LayoutDashboard,
  ShieldCheck,
  Package,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLocation } from '../../context/LocationContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { LocationPickerModal } from './LocationPickerModal';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, logout, quickLoginDemo } = useAuth();
  const { totalItemsCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { selectedLocation, isGpsActive } = useLocation();
  const navigate = useNavigate();
  const location = useRouterLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isCustomer = !user || user.role === 'CUSTOMER';
  const isShopkeeper = user?.role === 'SHOPKEEPER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      {/* Top Demo Banner for easy testing */}
      <div className="bg-navy-950 text-slate-300 text-xs py-1.5 px-4 border-b border-navy-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">
              NearStyle College Project Demo
            </span>
            <span className="hidden sm:inline text-slate-400">| Try Before You Buy</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden md:inline">Quick Demo Sign-In:</span>
            <button
              onClick={() => quickLoginDemo('CUSTOMER')}
              className="text-[11px] font-semibold text-brand-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
            >
              Demo Customer
            </button>
            <button
              onClick={() => quickLoginDemo('SHOPKEEPER')}
              className="text-[11px] font-semibold text-amber-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
            >
              Demo Shopkeeper
            </button>
            <button
              onClick={() => quickLoginDemo('ADMIN')}
              className="text-[11px] font-semibold text-rose-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-4 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform">
                  <span className="text-brand-400">N</span>
                  <span className="text-white">S</span>
                </div>
                <div>
                  <span className="font-extrabold text-lg text-navy-950 tracking-tight block leading-none">
                    Near<span className="text-brand-600">Style</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium tracking-wider hidden sm:block">
                    Try Before You Buy
                  </span>
                </div>
              </Link>

              {/* Location Picker Pill */}
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-medium transition-all"
              >
                <MapPin className={`w-3.5 h-3.5 ${isGpsActive ? 'text-emerald-600' : 'text-brand-600'}`} />
                <span className="max-w-[120px] truncate">
                  {selectedLocation.area}, {selectedLocation.city}
                </span>
                <span className="text-[10px] text-slate-400 ml-0.5 font-normal">Change</span>
              </button>
            </div>

            {/* Global Search Bar (Customer Mode) */}
            {isCustomer && (
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex flex-1 max-w-md mx-2 relative items-center"
              >
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products across nearby stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </form>
            )}

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {isCustomer && (
                <>
                  <Link
                    to="/stores"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname === '/stores' ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                    }`}
                  >
                    Nearby Stores
                  </Link>

                  <Link
                    to="/products"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname === '/products' ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                    }`}
                  >
                    Explore Products
                  </Link>

                  <Link
                    to="/reservations"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname === '/reservations' ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    Reserve & Try
                  </Link>

                  <Link
                    to="/wishlist"
                    className="relative p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    title="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistIds.size > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white shadow-xs">
                        {wishlistIds.size}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    className="relative p-2 rounded-xl text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    title="Cart"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {totalItemsCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white shadow-xs">
                        {totalItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Shopkeeper Links */}
              {isShopkeeper && (
                <>
                  <Link
                    to="/shopkeeper/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname.startsWith('/shopkeeper/dashboard') ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    to="/shopkeeper/products"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname.startsWith('/shopkeeper/products') ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Products
                  </Link>

                  <Link
                    to="/shopkeeper/inventory"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname.startsWith('/shopkeeper/inventory') ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Quick Inventory
                  </Link>

                  <Link
                    to="/shopkeeper/reservations"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname.startsWith('/shopkeeper/reservations') ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Reservations
                  </Link>

                  <Link
                    to="/shopkeeper/orders"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      location.pathname.startsWith('/shopkeeper/orders') ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:text-brand-600'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Orders
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                </>
              )}

              {/* Notifications */}
              {user && <NotificationsDropdown />}

              {/* User Dropdown / Login CTA */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    to={isShopkeeper ? '/shopkeeper/my-store' : '/profile'}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link to="/customer/login">
                    <Button variant="ghost" size="sm" className="text-xs font-semibold">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/shopkeeper/login">
                    <Button variant="outline" size="sm" className="text-xs font-semibold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100">
                      Shopkeeper
                    </Button>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Actions & Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              {isCustomer && (
                <>
                  <Link to="/cart" className="relative p-2 text-slate-700">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItemsCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                        {totalItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {user && <NotificationsDropdown />}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
            {/* Mobile Location Selector */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  {selectedLocation.area}, {selectedLocation.city}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-[11px] py-1 px-2.5"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLocationModalOpen(true);
                }}
              >
                Change
              </Button>
            </div>

            {/* Mobile Search */}
            {isCustomer && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </form>
            )}

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-1">
              {isCustomer && (
                <>
                  <Link
                    to="/stores"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50"
                  >
                    Nearby Stores
                  </Link>
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50"
                  >
                    Browse Catalog
                  </Link>
                  <Link
                    to="/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-600" />
                      Reserve & Try
                    </span>
                    <span className="text-[11px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                      8hr hold
                    </span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>My Wishlist</span>
                    {wishlistIds.size > 0 && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                        {wishlistIds.size}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50"
                  >
                    My Orders
                  </Link>
                </>
              )}

              {isShopkeeper && (
                <>
                  <Link
                    to="/shopkeeper/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-brand-600 bg-brand-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link
                    to="/shopkeeper/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" /> Products
                  </Link>
                  <Link
                    to="/shopkeeper/inventory"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" /> Quick Inventory
                  </Link>
                  <Link
                    to="/shopkeeper/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" /> Manage Reservations
                  </Link>
                  <Link
                    to="/shopkeeper/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> Orders
                  </Link>
                  <Link
                    to="/shopkeeper/my-store"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl font-medium text-sm text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <StoreIcon className="w-4 h-4" /> Store Settings
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl font-medium text-sm text-brand-600 bg-brand-50"
                >
                  Admin Control Panel
                </Link>
              )}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-3 border-t border-slate-200">
              {user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/customer/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Customer Login
                    </Button>
                  </Link>
                  <Link to="/shopkeeper/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-amber-300 bg-amber-50 text-amber-900">
                      Shopkeeper
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Location Modal */}
      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
};
