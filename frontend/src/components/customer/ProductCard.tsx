import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';
import { IProduct } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { Badge } from '../common/Badge';

interface ProductCardProps {
  product: IProduct;
  onOpenReserve?: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenReserve }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product._id);

  const store = typeof product.storeId === 'object' ? product.storeId : null;
  const storeName = store ? store.name : 'Local Boutique';
  const storeArea = store ? store.area : '';

  const originalPrice = product.price;
  const currentPrice = product.discountPrice || product.price;
  const discountPercent =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  // Calculate available stock
  const totalAvailable = product.sizes.reduce(
    (sum, s) => sum + Math.max(0, s.quantity - (s.reserved || 0)),
    0
  );
  const isOutOfStock = totalAvailable === 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Product Image Container */}
      <div className="relative aspect-3/4 w-full bg-slate-100 overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            wishlisted
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {product.reservationEligible && !isOutOfStock && (
            <span className="bg-brand-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Clock className="w-3 h-3" /> Try In Store
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Distance Badge */}
        {product.distanceKm !== undefined && product.distanceKm !== null && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-slate-200/50">
              <MapPin className="w-3 h-3 text-brand-600" />
              {product.distanceKm} km away
            </span>
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Store & Category */}
          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 font-medium mb-1">
            <span className="truncate hover:text-brand-600 font-semibold">{storeName}</span>
            {storeArea && <span className="shrink-0 text-slate-400">• {storeArea}</span>}
          </div>

          {/* Product Title */}
          <Link to={`/products/${product._id}`}>
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Sizes available */}
          <div className="flex flex-wrap gap-1 mt-2 items-center">
            {product.sizes.map((s, idx) => {
              const avail = s.quantity - (s.reserved || 0);
              return (
                <span
                  key={idx}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    avail > 0
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-50 text-slate-300 line-through'
                  }`}
                  title={`${s.size}: ${avail > 0 ? `${avail} in stock` : 'Out of stock'}`}
                >
                  {s.size}
                </span>
              );
            })}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{currentPrice.toLocaleString()}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action */}
          {onOpenReserve && product.reservationEligible && !isOutOfStock ? (
            <button
              type="button"
              onClick={() => onOpenReserve(product)}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              Reserve
            </button>
          ) : (
            <Link
              to={`/products/${product._id}`}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
