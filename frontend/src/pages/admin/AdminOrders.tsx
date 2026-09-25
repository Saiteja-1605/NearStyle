import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { IOrder } from '../../types';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/orders');
        setOrders(res.data || []);
      } catch (err) {
        console.warn('Failed to load admin orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
      </div>

      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
          Audit & Compliance
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Platform Orders Log ({orders.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Recent transactions and order fulfillment activities across all stores.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading order logs...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {orders.map((o) => {
              const customer = typeof o.customerId === 'object' ? o.customerId : null;
              const store = typeof o.storeId === 'object' ? o.storeId : null;

              return (
                <div key={o._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">#{o.orderNumber}</span>
                      <span className="text-slate-400">• {new Date(o.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Customer: <strong>{customer?.name || o.shippingAddress?.fullName}</strong> ({customer?.email})
                    </p>
                    <p className="text-slate-500">
                      Store: <strong>{store?.name || 'Local Store'}</strong> ({store?.city})
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="font-black text-sm text-slate-900 block">
                        ₹{o.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {o.orderType.toLowerCase().replace('_', ' ')} • {o.paymentMethod}
                      </span>
                    </div>

                    <span
                      className={`font-bold px-3 py-1 rounded-full border text-[11px] ${
                        o.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : o.orderStatus === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {o.orderStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
