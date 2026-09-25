import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  IndianRupee,
  Plus,
  Layers,
  Search,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { ReservationVerificationModal } from '../../components/shopkeeper/ReservationVerificationModal';

export const Dashboard: React.FC = () => {
  const { user, store } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/shopkeeper');
      setAnalytics(res.data);
    } catch (err) {
      console.warn('Failed to load shopkeeper analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const metrics = analytics?.metrics || {
    todaySales: 0,
    todayOrdersCount: 0,
    activeReservations: 0,
    totalProducts: 0,
    lowStockCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-950 text-white p-6 sm:p-8 rounded-3xl border border-navy-900 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
            Merchant Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {store?.name || 'My Fashion Store'}
          </h1>
          <p className="text-xs text-slate-400">
            Welcome back, {user?.name}. Here is your store summary for today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            className="font-bold text-xs sm:text-sm"
            onClick={() => setVerifyModalOpen(true)}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Verify Reservation Code
          </Button>

          <Link to="/shopkeeper/products/add">
            <Button
              variant="outline"
              size="md"
              className="font-bold text-xs sm:text-sm bg-white text-slate-900 hover:bg-slate-100"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 5 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            ₹{metrics.todaySales.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Confirmed orders</span>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            {metrics.todayOrdersCount}
          </p>
          <Link to="/shopkeeper/orders" className="text-[11px] font-bold text-brand-600 hover:underline mt-1">
            Manage orders →
          </Link>
        </div>

        {/* Active Reservations */}
        <div className="bg-white rounded-2xl border border-brand-200 p-5 shadow-xs flex flex-col justify-between bg-brand-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              Active Holds
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-700 mt-3">
            {metrics.activeReservations}
          </p>
          <Link to="/shopkeeper/reservations" className="text-[11px] font-bold text-brand-600 hover:underline mt-1">
            View 8hr holds →
          </Link>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            {metrics.totalProducts}
          </p>
          <Link to="/shopkeeper/products" className="text-[11px] font-bold text-brand-600 hover:underline mt-1">
            View products →
          </Link>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs flex flex-col justify-between bg-amber-50/20 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-3">
            {metrics.lowStockCount}
          </p>
          <Link to="/shopkeeper/inventory" className="text-[11px] font-bold text-amber-700 hover:underline mt-1">
            Restock items →
          </Link>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/shopkeeper/inventory"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quick Inventory Updater</h3>
              <p className="text-xs text-slate-500">Adjust stock with instant + / - buttons</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <button
          onClick={() => setVerifyModalOpen(true)}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all flex items-center justify-between group text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verify Customer In-Store</h3>
              <p className="text-xs text-slate-500">Enter customer's NS-RES hold code</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </button>

        <Link
          to="/shopkeeper/analytics"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sales & Trend Analytics</h3>
              <p className="text-xs text-slate-500">Revenue, top styles, customer demand</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Top Selling Products Preview */}
      {analytics?.topProducts?.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Top Selling Products
            </h3>
            <Link to="/shopkeeper/analytics" className="text-xs font-bold text-brand-600 hover:underline">
              View Detailed Analytics →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {analytics.topProducts.map((p: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{p.name}</span>
                <div className="flex items-center gap-6">
                  <span className="text-slate-500">{p.units} units sold</span>
                  <span className="font-extrabold text-slate-900 min-w-[70px] text-right">
                    ₹{p.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <ReservationVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onSuccessAction={fetchAnalytics}
      />
    </div>
  );
};
