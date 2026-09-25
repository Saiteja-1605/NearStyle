import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Store as StoreIcon,
  ChevronRight,
} from 'lucide-react';
import { IProduct, IStore } from '../types';
import api from '../services/api';
import { ProductCard } from '../components/customer/ProductCard';
import { StoreCard } from '../components/customer/StoreCard';
import { ReserveModal } from '../components/customer/ReserveModal';
import { ProductCardSkeleton, StoreCardSkeleton } from '../components/common/SkeletonLoader';
import { Button } from '../components/common/Button';
import { useLocation } from '../context/LocationContext';

const POPULAR_CATEGORIES = [
  { name: 'Shirts', count: '12+ Styles', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80', query: 'category=Men&subcategory=Shirts' },
  { name: 'Dresses', count: '15+ Styles', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=400&q=80', query: 'category=Women&subcategory=Dresses' },
  { name: 'Ethnic Kurtas', count: '10+ Styles', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80', query: 'subcategory=Kurtas' },
  { name: 'Silk Sarees', count: '8+ Styles', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80', query: 'subcategory=Sarees' },
  { name: 'Denim & Jeans', count: '14+ Styles', image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=400&q=80', query: 'subcategory=Jeans' },
  { name: 'Footwear', count: '9+ Styles', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80', query: 'category=Footwear' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocation, userCoords } = useLocation();

  const [search, setSearch] = useState('');
  const [stores, setStores] = useState<IStore[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<IProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Reserve modal state
  const [reservingProduct, setReservingProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const coordsParam = userCoords ? `&lat=${userCoords.lat}&lng=${userCoords.lng}` : '';

        // Fetch stores
        const storesRes = await api.get(`/stores?city=${selectedLocation.city}${coordsParam}`);
        setStores((storesRes.data || []).slice(0, 4));

        // Fetch trending & arrivals
        const productsRes = await api.get(`/products?${coordsParam}`);
        const allProds: IProduct[] = productsRes.data || [];

        setTrendingProducts(allProds.slice(0, 4));
        setNewArrivals(allProds.slice(4, 8));
      } catch (err) {
        console.warn('Could not load home data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocation, userCoords]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 rounded-3xl mx-3 sm:mx-6 mt-4 border border-navy-900 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-navy-950 to-navy-950 -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Hyper-Local Fashion Revolution</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Discover Nearby. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-300 via-indigo-300 to-white bg-clip-text text-transparent">
              Try Before You Buy.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Explore authentic fashion from physical boutiques in <strong>{selectedLocation.area}, {selectedLocation.city}</strong>. Reserve any product online for 8 hours, visit the store, try it in person, and decide before paying.
          </p>

          {/* Search Bar in Hero */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-xl mx-auto flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200"
          >
            <div className="flex items-center gap-2 pl-3 flex-1 text-slate-400">
              <Search className="w-5 h-5 shrink-0" />
              <input
                type="text"
                placeholder="Search casual shirts, banarasi sarees, dresses, jeans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2 bg-transparent text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              variant="dark"
              size="md"
              className="rounded-xl px-5 py-2.5 font-bold shrink-0"
            >
              Search
            </Button>
          </form>

          {/* Quick links under hero */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Quick Searches:</span>
            <Link to="/products?category=Men&subcategory=Shirts" className="hover:text-white underline">
              Men's Shirts
            </Link>
            <span>•</span>
            <Link to="/products?category=Women&subcategory=Dresses" className="hover:text-white underline">
              Summer Dresses
            </Link>
            <span>•</span>
            <Link to="/products?subcategory=Kurtas" className="hover:text-white underline">
              Kurtas
            </Link>
            <span>•</span>
            <Link to="/products?category=Footwear" className="hover:text-white underline">
              Sneakers
            </Link>
          </div>
        </div>
      </section>

      {/* Reserve & Try 3-Step Interactive Explainer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-50/70 border border-brand-100 rounded-3xl p-6 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              How Reserve & Try Works
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Zero-Risk In-Store Fitting
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-brand-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-base">Find & Reserve Online</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Browse live stock at nearby fashion stores. Click <strong>Reserve & Try</strong> to hold your size for 8 hours with zero advance payment.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-base">Visit & Try In-Store</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Walk into the store anytime within the 8-hour window. Show your simple <strong>NS-RES</strong> code to the shopkeeper and try the item in the fitting room.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-base">Buy Only If Satisfied</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Love the fit? Purchase it right there at the checkout. Don't like it? Walk away with zero penalties. The reservation automatically expires!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl font-black text-slate-900">Popular Categories</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {POPULAR_CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?${cat.query}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-900 shadow-xs hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-bold text-sm leading-tight group-hover:text-brand-300 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nearby Stores Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" />
              <span>In Your Vicinity</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Nearby Stores in {selectedLocation.area}
            </h2>
          </div>
          <Link
            to="/stores"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All Stores <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StoreCardSkeleton />
            <StoreCardSkeleton />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">No stores found in this area.</p>
            <Link to="/stores" className="text-xs font-bold text-brand-600 mt-2 inline-block">
              Browse stores in all areas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <StoreCard key={store._id} store={store} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              High Demand
            </span>
            <h2 className="text-2xl font-black text-slate-900">Trending Now</h2>
          </div>
          <Link
            to="/products?sort=rating"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Explore More <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpenReserve={(p) => setReservingProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Just In
            </span>
            <h2 className="text-2xl font-black text-slate-900">New Arrivals</h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpenReserve={(p) => setReservingProduct(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Shopkeeper CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-navy-800 shadow-xl">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
              For Local Fashion Store Owners
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bring Customers from their Phones to your Fitting Rooms
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              List your inventory on NearStyle in under 5 minutes. Receive verified Reserve & Try holds and convert walk-ins into loyal paying customers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/shopkeeper/register">
              <Button variant="primary" size="lg" className="w-full font-bold">
                Join NearStyle as Shopkeeper
              </Button>
            </Link>
            <Link to="/shopkeeper/login">
              <Button variant="outline" size="lg" className="w-full text-slate-900 font-bold bg-white hover:bg-slate-100">
                Merchant Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Reservation Dialog */}
      <ReserveModal
        product={reservingProduct}
        isOpen={Boolean(reservingProduct)}
        onClose={() => setReservingProduct(null)}
      />
    </div>
  );
};
