import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import api from '../../services/api';

export const Analytics: React.FC = () => {
  const [storeAnalytics, setStoreAnalytics] = useState<any>(null);
  const [platformTrends, setPlatformTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storeRes, trendsRes] = await Promise.all([
          api.get('/analytics/shopkeeper'),
          api.get('/analytics/trends'),
        ]);
        setStoreAnalytics(storeRes.data);
        setPlatformTrends(trendsRes.data);
      } catch (err) {
        console.warn('Could not load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-16 text-center text-xs text-slate-400">Loading analytics...</div>;
  }

  const metrics = storeAnalytics?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
          Performance & Demand
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Store Analytics & Market Trends
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your store revenue and understand real-time fashion demand trends across the neighborhood.
        </p>
      </div>

      {/* Sales Overview */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Sales Performance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Sales
            </span>
            <p className="text-3xl font-black text-slate-900">
              ₹{(metrics.todaySales || 0).toLocaleString()}
            </p>
            <span className="text-xs text-slate-400 block">
              {metrics.todayOrdersCount || 0} order(s) placed today
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Last 7 Days Sales
            </span>
            <p className="text-3xl font-black text-slate-900">
              ₹{(metrics.weeklySales || 0).toLocaleString()}
            </p>
            <span className="text-xs text-slate-400 block">Weekly rolling revenue</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Last 30 Days Sales
            </span>
            <p className="text-3xl font-black text-slate-900">
              ₹{(metrics.monthlySales || 0).toLocaleString()}
            </p>
            <span className="text-xs text-slate-400 block">Monthly gross sales</span>
          </div>
        </div>
      </section>

      {/* Top Products & In-Store Reserve Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Top Performing Products
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {storeAnalytics?.topProducts?.length === 0 ? (
              <p className="text-slate-400 py-4">No sales recorded yet.</p>
            ) : (
              storeAnalytics?.topProducts?.map((p: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">₹{p.revenue.toLocaleString()}</span>
                    <span className="text-slate-400 text-[11px] block">{p.units} units</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reserve & Try Conversions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Reserve & Try Impact</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100">
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block">
                Active Holds
              </span>
              <p className="text-2xl font-black text-brand-900 mt-1">
                {metrics.activeReservations || 0}
              </p>
              <span className="text-[10px] text-brand-600">Pending customer in-store visits</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Converted to Buy
              </span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {metrics.completedReservations || 0}
              </p>
              <span className="text-[10px] text-emerald-600">Purchased after trying</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed pt-2">
            Reserve & Try gives customers the confidence of an in-store fitting room before making a purchase decision.
          </p>
        </div>
      </div>

      {/* Platform Trend Insights (#34) */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>Local Market Trend Intelligence</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            What Nearby Shoppers Are Searching For
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated anonymized market demand signals to help you stock high-converting styles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Top Sizes */}
          <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Most Demanded Sizes
            </h4>
            <div className="space-y-2">
              {platformTrends?.popularSizes?.map((s: any) => (
                <div key={s.size} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Size {s.size}</span>
                  <span className="text-brand-400 font-extrabold">{s.share}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Colors */}
          <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trending Colours
            </h4>
            <div className="space-y-2">
              {platformTrends?.popularColors?.map((c: any) => (
                <div key={c.color} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{c.color}</span>
                  <span className="text-emerald-400 font-bold text-[11px]">{c.demand}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Ranges */}
          <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Popular Price Ranges
            </h4>
            <div className="space-y-2">
              {platformTrends?.popularPriceRanges?.map((p: any) => (
                <div key={p.range} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{p.range}</span>
                    <span className="font-bold text-white">{p.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
