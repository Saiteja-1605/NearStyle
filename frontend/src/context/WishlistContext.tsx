import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IProduct } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistProducts: IProduct[];
  wishlistIds: Set<string>;
  loading: boolean;
  toggleWishlist: (product: IProduct) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistProducts, setWishlistProducts] = useState<IProduct[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setWishlistProducts([]);
      setWishlistIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      const products: IProduct[] = res.data || [];
      setWishlistProducts(products);
      setWishlistIds(new Set(products.map((p) => p._id)));
    } catch (err) {
      console.warn('Could not fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (product: IProduct) => {
    if (!user) {
      info('Please sign in as a customer to save items to your wishlist.');
      return;
    }

    try {
      const res = await api.post('/wishlist/toggle', { productId: product._id });
      const isAdded = res.data.added;

      if (isAdded) {
        setWishlistProducts((prev) => [...prev, product]);
        setWishlistIds((prev) => new Set(prev).add(product._id));
        success(`Added "${product.name}" to wishlist`);
      } else {
        setWishlistProducts((prev) => prev.filter((p) => p._id !== product._id));
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(product._id);
          return next;
        });
        info(`Removed from wishlist`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update wishlist');
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.has(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistProducts,
        wishlistIds,
        loading,
        toggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
