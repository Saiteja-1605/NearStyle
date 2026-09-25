import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Store,
  Users,
  Package,
  ShoppingBag,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/metrics');
        setMetrics(res.data);
      } catch (err) {
        console.warn('Failed to load admin metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-16 text-center text-xs text-slate-400">Loading admin metrics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-navy-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            NearStyle Master Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System health, store onboarding approvals, user directories, and platform revenue.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/admin/stores">
            <Button variant="danger" size="md" className="font-bold text-xs sm:text-sm">
              Review Store Approvals ({metrics?.pendingStores || 0} Pending)
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Customers
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.totalCustomers || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Stores
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.totalStores || 0}</p>
          <span className="text-[11px] text-amber-600 font-bold block mt-1">
            {metrics?.pendingStores || 0} Pending
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Products
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.totalProducts || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Orders
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.totalOrders || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Reservations
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.totalReservations || 0}</p>
          <span className="text-[11px] text-brand-600 font-bold block mt-1">
            {metrics?.activeReservations || 0} Active
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Gross Revenue
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            ₹{(metrics?.grossRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/stores"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-lg transition-all space-y-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Store Approval Queue</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Review newly registered physical shops. Approve or reject stores before they appear to customers.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-lg transition-all space-y-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">User Directory</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            View registered customer accounts, verified shopkeeper profiles, and contact credentials.
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-lg transition-all space-y-2 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Platform Orders Audit</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect all transactions, order statuses, return requests, and pickup logs across the system.
          </p>
        </Link>
      </div>
    </div>
  );
};
