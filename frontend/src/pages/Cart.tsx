import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, deliveryFee, totalAmount, clearCart } =
    useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6" />}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any fashion items to your bag yet."
          actionText="Explore Nearby Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {cart.length} unique style{cart.length > 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div
              key={`${item.productId}-${item.size}-${item.colour}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-xl shrink-0 border border-slate-100"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {item.storeName}
                  </span>
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm sm:text-base font-bold text-slate-900 hover:text-brand-600 truncate block mt-0.5"
                  >
                    {item.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      Size: {item.size}
                    </span>
                    <span>•</span>
                    <span>Colour: {item.colour}</span>
                  </div>

                  <p className="text-sm font-extrabold text-slate-900 mt-2 sm:hidden">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Quantity Stepper & Price */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, item.colour, -1)}
                    disabled={item.quantity <= 1}
                    className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, item.colour, 1)}
                    disabled={item.quantity >= item.maxAvailable}
                    className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal Item Price */}
                <div className="text-right hidden sm:block min-w-[80px]">
                  <p className="text-sm font-extrabold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    ₹{item.price.toLocaleString()} each
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId, item.size, item.colour)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Column */}
        <div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 sticky top-24 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Order Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Delivery Fee</span>
                <span className="font-semibold text-slate-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              {subtotal < 999 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Add ₹{(999 - subtotal).toLocaleString()} more for free standard delivery!
                </p>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-base text-brand-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md"
              onClick={() => navigate('/checkout')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure College Demo Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
