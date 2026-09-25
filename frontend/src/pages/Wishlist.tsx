import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const Wishlist: React.FC = () => {
  const { wishlistProducts, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product: any) => {
    // Pick first available size
    const availableSize = product.sizes.find(
      (s: any) => s.quantity - (s.reserved || 0) > 0
    );

    if (!availableSize) {
      alert('This product is currently out of stock.');
      return;
    }

    const colour = product.colors?.[0] || 'Standard';
    const added = addToCart(product, availableSize.size, colour, 1);
    if (added) {
      toggleWishlist(product);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-xs text-slate-400">
        Loading saved items...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {wishlistProducts.length} saved fashion item{wishlistProducts.length > 1 ? 's' : ''} in your collection
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-6 h-6" />}
          title="Your Wishlist is Empty"
          description="Save the outfits and styles you love from nearby stores so you can easily reserve or buy them later."
          actionText="Browse Fashion Items"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map((product) => {
            const store = typeof product.storeId === 'object' ? product.storeId : null;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-3/4 bg-slate-100">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </Link>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 shadow-xs"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                      {store?.name || 'Local Store'}
                    </span>
                    <Link to={`/products/${product._id}`}>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 hover:text-brand-600 line-clamp-1">
                        {product.name}
                      </h4>
                    </Link>
                    <p className="text-sm font-extrabold text-slate-900 mt-1">
                      ₹{(product.discountPrice || product.price).toLocaleString()}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold"
                    onClick={() => handleMoveToCart(product)}
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                  >
                    Move to Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
