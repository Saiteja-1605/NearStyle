import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Star, Navigation, ArrowLeft } from 'lucide-react';
import { IStore, IProduct } from '../types';
import api from '../services/api';
import { ProductCard } from '../components/customer/ProductCard';
import { ReserveModal } from '../components/customer/ReserveModal';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const StoreDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservingProduct, setReservingProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/stores/${id}`);
        setStore(res.data.store);
        setProducts(res.data.products || []);
      } catch (err) {
        console.warn('Failed to load store', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStore();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <EmptyState
          title="Store Not Found"
          description="The store you requested does not exist or may have been deactivated."
          actionText="Browse All Stores"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  const handleDirections = () => {
    const query = encodeURIComponent(`${store.name}, ${store.address}, ${store.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/stores"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stores
        </Link>
      </div>

      {/* Store Banner & Info Header */}
      <div className="relative rounded-3xl overflow-hidden bg-navy-950 text-white border border-navy-900 shadow-xl">
        {/* Cover Photo */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="p-6 sm:p-8 -mt-20 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-brand-500/20 text-brand-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-brand-500/30">
                  Verified Local Merchant
                </span>
                {store.allowsReservation && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Reserve & Try Active
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {store.name}
              </h1>

              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 mt-2 font-medium">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{store.address}, {store.area}, {store.city}</span>
              </p>
            </div>

            {/* Actions & Rating */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-xs font-bold text-white border border-white/10">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{store.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({store.reviewCount} reviews)</span>
              </div>

              <Button
                variant="primary"
                size="md"
                className="font-bold shadow-md"
                onClick={handleDirections}
                leftIcon={<Navigation className="w-4 h-4" />}
              >
                Get Directions
              </Button>
            </div>
          </div>

          {/* Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-navy-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Hours: {store.openingTime} - {store.closingTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Contact: {store.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Email: {store.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Product Catalog */}
      <div className="space-y-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              In-Store Inventory
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">
              Available at {store.name}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {products.length} Items Listed
          </span>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No Products In Stock"
            description="This store has not published any active items right now. Check back soon!"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={{ ...product, storeId: store }}
                onOpenReserve={(p) => setReservingProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reservation Dialog */}
      <ReserveModal
        product={reservingProduct}
        isOpen={Boolean(reservingProduct)}
        onClose={() => setReservingProduct(null)}
      />
    </div>
  );
};
