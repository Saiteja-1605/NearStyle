import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, Package, ChevronRight, RotateCcw, AlertCircle } from 'lucide-react';
import { IOrder } from '../types';
import api from '../services/api';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnOrder, setReturnOrder] = useState<IOrder | null>(null);
  const [returnReason, setReturnReason] = useState('Doesn\'t fit');
  const [returnNotes, setReturnNotes] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const { success, error } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my');
      setOrders(res.data || []);
    } catch (err) {
      console.warn('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrder) return;

    try {
      setIsSubmittingReturn(true);
      await api.post(`/orders/${returnOrder._id}/return`, {
        reason: returnReason,
        notes: returnNotes,
      });

      success('Return request submitted. The store has been notified!');
      setReturnOrder(null);
      setReturnNotes('');
      fetchOrders();
    } catch (err: any) {
      error(err.message || 'Failed to submit return request.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'READY':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PREPARING':
      case 'CONFIRMED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'RETURN_REQUESTED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track the fulfillment status of your local orders and returns.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6" />}
          title="No Orders Placed Yet"
          description="You haven't ordered any outfits yet. Check nearby stores for styles you love!"
          actionText="Start Shopping"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const store = typeof order.storeId === 'object' ? order.storeId : null;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-14 object-cover rounded-lg border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Size: <strong className="text-slate-800">{item.size}</strong> • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Bar: Total & Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Store: </span>
                    <span className="font-bold text-slate-800">{store?.name || 'Local Store'}</span>
                    <span className="text-slate-400 ml-2">
                      ({order.orderType === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">
                      Total: ₹{order.totalAmount.toLocaleString()}
                    </span>

                    {/* Return Action if Delivered */}
                    {order.orderStatus === 'DELIVERED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReturnOrder(order)}
                        className="text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50"
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Request Return
                      </Button>
                    )}

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnOrder && (
        <Modal
          isOpen={Boolean(returnOrder)}
          onClose={() => setReturnOrder(null)}
          title={`Request Return for #${returnOrder.orderNumber}`}
          description="Select your reason for return. The store will review and arrange reverse pickup or store return."
          maxWidth="md"
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Reason for Return
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Doesn't fit">Doesn't fit</option>
                <option value="Colour differs">Colour differs from photo</option>
                <option value="Damaged">Damaged or defective</option>
                <option value="Not as expected">Not as expected</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                placeholder="Describe the issue..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                className="w-1/2"
                onClick={() => setReturnOrder(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-1/2"
                isLoading={isSubmittingReturn}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
