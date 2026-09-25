import React, { createContext, useContext, useState, useEffect } from 'react';
import { ICartItem, IProduct } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: ICartItem[];
  addToCart: (product: IProduct, size: string, colour: string, quantity?: number) => boolean;
  removeFromCart: (productId: string, size: string, colour: string) => void;
  updateQuantity: (productId: string, size: string, colour: string, delta: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<ICartItem[]>(() => {
    const saved = localStorage.getItem('nearstyle_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  const { success, warning } = useToast();

  useEffect(() => {
    localStorage.setItem('nearstyle_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: IProduct, size: string, colour: string, quantity = 1): boolean => {
    const upperSize = size.toUpperCase();
    const sizeStock = product.sizes.find((s) => s.size === upperSize);
    const maxAvailable = sizeStock ? Math.max(0, sizeStock.quantity - (sizeStock.reserved || 0)) : 0;

    if (maxAvailable < 1) {
      warning(`Size ${upperSize} is currently out of stock.`);
      return false;
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product._id &&
        item.size === upperSize &&
        item.colour.toLowerCase() === colour.toLowerCase()
    );

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      const newQty = existing.quantity + quantity;

      if (newQty > maxAvailable) {
        warning(`Cannot add more than ${maxAvailable} available units for Size ${upperSize}.`);
        return false;
      }

      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
      success(`Updated quantity in cart (${newQty} items)`);
      return true;
    } else {
      const storeName = typeof product.storeId === 'object' ? product.storeId.name : 'Store';
      const storeId = typeof product.storeId === 'object' ? product.storeId._id : product.storeId;

      const newItem: ICartItem = {
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        brand: product.brand,
        size: upperSize,
        colour,
        price: product.discountPrice || product.price,
        quantity: Math.min(quantity, maxAvailable),
        storeId,
        storeName,
        maxAvailable,
      };

      setCart([...cart, newItem]);
      success(`Added "${product.name}" (${upperSize}) to cart!`);
      return true;
    }
  };

  const removeFromCart = (productId: string, size: string, colour: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.size === size && item.colour === colour)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, colour: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size && item.colour === colour) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (newQty > item.maxAvailable) {
            warning(`Only ${item.maxAvailable} units currently in stock.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('nearstyle_cart');
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 999 || totalItemsCount === 0 ? 0 : 49;
  const totalAmount = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal,
        deliveryFee,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
