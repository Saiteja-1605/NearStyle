import React, { useState, useEffect } from 'react';
import { Store, Check, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchStores = async () => {
    try {
      setLoading(true);
      const query = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
      const res = await api.get(`/admin/stores${query}`);
      setStores(res.data || []);
    } catch (err) {
      console.warn('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filterStatus]);

  const handleUpdateStatus = async (storeId: string, status: string) => {
    try {
      setUpdatingId(storeId);
      await api.patch(`/admin/stores/${storeId}/status`, { status });
      success(`Store marked as ${status}`);
      fetchStores();
    } catch (err: any) {
      error(err.message || 'Failed to update store status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Merchant Moderation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Store Approval Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review store onboarding requests. Only APPROVED stores appear in customer search.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterStatus === st
                  ? 'bg-navy-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading stores...</div>
      ) : stores.length === 0 ? (
        <EmptyState
          icon={<Store className="w-6 h-6" />}
          title="No Stores Found"
          description="There are currently no stores matching this filter status."
        />
      ) : (
        <div className="space-y-4">
          {stores.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-16 h-20 object-cover rounded-2xl border border-slate-200 shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">{s.name}</h3>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        s.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Owner: <strong className="text-slate-800">{s.ownerId?.name || 'Store Owner'}</strong> • {s.phone}
                  </p>
                  <p className="text-xs text-slate-500">
                    Address: {s.address}, {s.area}, {s.city}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {s.categories.map((c: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                {s.status !== 'APPROVED' && (
                  <Button
                    variant="success"
                    size="sm"
                    disabled={updatingId === s._id}
                    onClick={() => handleUpdateStatus(s._id, 'APPROVED')}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Approve Store
                  </Button>
                )}

                {s.status === 'PENDING' && (
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={updatingId === s._id}
                    onClick={() => handleUpdateStatus(s._id, 'REJECTED')}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>
                )}

                {s.status === 'APPROVED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-700 border-amber-200 hover:bg-amber-50"
                    disabled={updatingId === s._id}
                    onClick={() => handleUpdateStatus(s._id, 'SUSPENDED')}
                  >
                    Suspend Store
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
