import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, Clock, User, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { IOrder } from '../../types';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

const TABS = ['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

export const ShopkeeperOrders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusQuery = activeTab !== 'ALL' ? `?status=${activeTab}` : '';
      const res = await api.get(`/orders/store${statusQuery}`);
      setOrders(res.data || []);
    } catch (err) {
      console.warn('Could not fetch store orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      success(`Order status updated to ${nextStatus}`);
      fetchOrders();
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
          Store Operations
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Order Fulfillment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming pickup and delivery orders and transition their processing status.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeTab === tab
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading store orders...</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6" />}
          title="No Orders In This Tab"
          description="There are currently no orders with this status."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const customer = typeof order.customerId === 'object' ? order.customerId : null;
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-full font-bold">
                      {order.orderType === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'}
                    </span>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Content: Customer & Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Customer Information
                    </span>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.shippingAddress.fullName || customer?.name}</span>
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.shippingAddress.phone || customer?.phone}</span>
                    </p>
                    <p className="text-slate-500 pt-1">
                      {order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={it.image} alt="" className="w-9 h-11 object-cover rounded-md border border-slate-200 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{it.name}</p>
                            <p className="text-slate-400 text-[11px]">Size {it.size} • Qty {it.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">
                          ₹{(it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}

                    <div className="border-t border-slate-100 pt-2 flex justify-between text-xs font-black text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-brand-600">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  {order.orderStatus === 'PLACED' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order._id, 'CONFIRMED')}
                      >
                        Accept & Confirm
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order._id, 'CANCELLED')}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {order.orderStatus === 'CONFIRMED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                    >
                      Mark Preparing
                    </Button>
                  )}

                  {order.orderStatus === 'PREPARING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order._id, 'READY')}
                    >
                      Mark Ready for {order.orderType === 'STORE_PICKUP' ? 'Pickup' : 'Dispatch'}
                    </Button>
                  )}

                  {order.orderStatus === 'READY' && (
                    <Button
                      variant="success"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleUpdateStatus(order._id, 'DELIVERED')}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Complete & {order.orderType === 'STORE_PICKUP' ? 'Hand Over' : 'Deliver'}
                    </Button>
                  )}

                  {order.orderStatus === 'DELIVERED' && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Order Completed
                    </span>
                  )}

                  {order.orderStatus === 'CANCELLED' && (
                    <span className="text-xs text-rose-600 font-bold">
                      Order Cancelled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
