import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Truck, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { IOrder } from '../types';
import api from '../services/api';
import { EmptyState } from '../components/common/EmptyState';

const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.warn('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-xs text-slate-400">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <EmptyState
          title="Order Not Found"
          description="Could not locate this order in our system."
          actionText="Back to Orders"
          actionHref="/orders"
        />
      </div>
    );
  }

  const store = typeof order.storeId === 'object' ? order.storeId : null;
  const currentStepIdx = ORDER_STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Order Receipt
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Payment Status
            </span>
            <span
              className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full border ${
                order.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {order.paymentStatus} ({order.paymentMethod === 'COD' ? 'Cash/UPI on Delivery' : 'Demo Instant Payment'})
            </span>
          </div>
        </div>

        {/* Order Progress Tracker */}
        {order.orderStatus !== 'CANCELLED' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Order Progress
            </h3>

            <div className="grid grid-cols-5 gap-2 text-center">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step} className="space-y-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed ? 'bg-brand-600' : 'bg-slate-100'
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-xs font-bold block ${
                        isCurrent
                          ? 'text-brand-600'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Items Ordered
          </h3>

          <div className="divide-y divide-slate-100 border-y border-slate-100 py-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Size: <strong className="text-slate-700">{item.size}</strong> • Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <p className="text-[11px] text-slate-400">₹{item.price.toLocaleString()} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store & Shipping Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
          {/* Fulfillment Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              {order.orderType === 'STORE_PICKUP' ? (
                <>
                  <Store className="w-4 h-4 text-brand-600" />
                  <span>Store Pickup Location</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-brand-600" />
                  <span>Delivery Address</span>
                </>
              )}
            </h4>

            {order.orderType === 'STORE_PICKUP' ? (
              <div className="text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">{store?.name}</p>
                <p>{store?.address}, {store?.area}, {store?.city}</p>
                <p>Phone: {store?.phone}</p>
              </div>
            ) : (
              <div className="text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.area}, {order.shippingAddress.city} - {order.shippingAddress.pincode}</p>
                <p>Contact: {order.shippingAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider">
              Price Details
            </h4>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-semibold text-slate-900">
                  {order.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.deliveryFee}`}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Total Amount</span>
                <span className="text-brand-600">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
