import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Store,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { OrderType, PaymentMethod } from '../types';

export const Checkout: React.FC = () => {
  const { cart, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>('HOME_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DEMO_PAYMENT');
  const [loading, setLoading] = useState(false);

  // Address fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [area, setArea] = useState(user?.address?.area || 'Bandra');
  const [city, setCity] = useState(user?.address?.city || 'Mumbai');
  const [pincode, setPincode] = useState(user?.address?.pincode || '400050');

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const finalDeliveryFee = orderType === 'STORE_PICKUP' ? 0 : deliveryFee;
  const finalTotalAmount = subtotal + finalDeliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      info('Please sign in as a customer to place an order.');
      navigate('/customer/login');
      return;
    }

    if (!fullName || !phone || !city) {
      error('Please complete all contact and address fields.');
      return;
    }

    try {
      setLoading(true);

      const itemsPayload = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        colour: item.colour,
        price: item.price,
        quantity: item.quantity,
      }));

      const res = await api.post('/orders', {
        items: itemsPayload,
        shippingAddress: {
          fullName,
          phone,
          street,
          area,
          city,
          pincode,
        },
        orderType,
        paymentMethod,
      });

      clearCart();
      success('Order confirmed successfully!');
      navigate(`/orders/${res.data.order._id}`);
    } catch (err: any) {
      error(err.message || 'Could not place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Checkout & Confirmation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your items, choose delivery method, and place your order.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Selector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Fulfillment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  orderType === 'HOME_DELIVERY'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-400'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="orderType"
                  value="HOME_DELIVERY"
                  checked={orderType === 'HOME_DELIVERY'}
                  onChange={() => setOrderType('HOME_DELIVERY')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Truck className="w-4 h-4 text-brand-600" />
                    <span>Home Delivery</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Delivered to your doorstep by local store dispatch within 24-48 hours.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  orderType === 'STORE_PICKUP'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-400'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="orderType"
                  value="STORE_PICKUP"
                  checked={orderType === 'STORE_PICKUP'}
                  onChange={() => setOrderType('STORE_PICKUP')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Store className="w-4 h-4 text-brand-600" />
                    <span>Store Pickup (Free)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Packaged and ready for pickup at the store counter today. Zero delivery fee.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Contact & Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Contact & Address Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Aditi Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Phone Number"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />

              <div className="sm:col-span-2">
                <Input
                  label="Street Address / Flat / Landmark"
                  placeholder="e.g. Flat 402, Sea Green Apts, Perry Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <Input
                label="Area / Neighborhood"
                placeholder="e.g. Bandra"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />

              <Input
                label="City"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <Input
                label="Pincode"
                placeholder="e.g. 400050"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Payment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'DEMO_PAYMENT'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-400'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="DEMO_PAYMENT"
                  checked={paymentMethod === 'DEMO_PAYMENT'}
                  onChange={() => setPaymentMethod('DEMO_PAYMENT')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <CreditCard className="w-4 h-4 text-brand-600" />
                    <span>Demo Online Payment (Instant)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulated fast checkout for testing. No real card charged.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-400'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                    <Banknote className="w-4 h-4 text-slate-600" />
                    <span>Cash on Delivery / Pickup</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay with cash or UPI when collecting your outfit.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 sticky top-24 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Order Summary</h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={item.image} alt="" className="w-8 h-10 object-cover rounded-md shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-slate-400 text-[11px]">{item.size} • Qty {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {finalDeliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${finalDeliveryFee}`
                  )}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900">
                <span>Total Due</span>
                <span className="text-brand-600">₹{finalTotalAmount.toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Confirm & Place Order
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Local Fashion Purchase</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
