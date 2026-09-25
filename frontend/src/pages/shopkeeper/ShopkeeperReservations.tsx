import React, { useState, useEffect } from 'react';
import { Clock, Search, Check, XCircle, User, Phone, CheckCircle2 } from 'lucide-react';
import { IReservation } from '../../types';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ReservationVerificationModal } from '../../components/shopkeeper/ReservationVerificationModal';
import { useCountdown } from '../../hooks/useCountdown';
import { useToast } from '../../context/ToastContext';

const TABS = ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'ALL'];

const ReservationItemRow: React.FC<{
  reservation: IReservation;
  onRefresh: () => void;
}> = ({ reservation, onRefresh }) => {
  const countdown = useCountdown(reservation.expiresAt);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const customer = typeof reservation.customerId === 'object' ? reservation.customerId : null;
  const product = typeof reservation.productId === 'object' ? reservation.productId : null;

  const handleMarkPurchased = async () => {
    try {
      setLoading(true);
      await api.post(`/reservations/${reservation._id}/purchase`);
      success(`Customer purchase verified for ${reservation.reservationCode}!`);
      onRefresh();
    } catch (err: any) {
      error(err.message || 'Failed to complete reservation purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    try {
      setLoading(true);
      await api.post(`/reservations/${reservation._id}/release`);
      success(`Hold released for ${reservation.reservationCode}.`);
      onRefresh();
    } catch (err: any) {
      error(err.message || 'Failed to release hold');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            Verification Code
          </span>
          <span className="text-lg font-black text-brand-600 tracking-wider">
            {reservation.reservationCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {reservation.status === 'ACTIVE' && (
            <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{countdown.formatted} remaining</span>
            </div>
          )}

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              reservation.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : reservation.status === 'COMPLETED'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : reservation.status === 'EXPIRED'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {reservation.status}
          </span>
        </div>
      </div>

      {/* Item & Customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Product preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <img
            src={product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
            alt=""
            className="w-12 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 truncate">{product?.name || 'Item'}</h4>
            <p className="text-slate-600 mt-0.5">
              Size: <strong className="text-brand-600">{reservation.size}</strong> • Colour: {reservation.colour}
            </p>
            <p className="text-slate-400 mt-0.5">Qty: {reservation.quantity} unit held</p>
          </div>
        </div>

        {/* Customer details */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Customer Information
          </span>
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{customer?.name || 'Customer'}</span>
          </p>
          {customer?.phone && (
            <p className="text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer?.phone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons for Active Reservations */}
      {reservation.status === 'ACTIVE' && (
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRelease}
            isLoading={loading}
            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Release Hold
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={handleMarkPurchased}
            isLoading={loading}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Customer Purchased in Store
          </Button>
        </div>
      )}
    </div>
  );
};

export const ShopkeeperReservations: React.FC = () => {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const query = activeTab !== 'ALL' ? `?status=${activeTab}` : '';
      const res = await api.get(`/reservations/store${query}`);
      setReservations(res.data || []);
    } catch (err) {
      console.warn('Could not fetch store reservations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            In-Store Fitting Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Customer Reservations (8hr Holds)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active fitting holds, verify in-store visit codes, and mark purchases.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          className="font-bold shadow-md"
          onClick={() => setIsVerifyModalOpen(true)}
          leftIcon={<Search className="w-4 h-4" />}
        >
          Verify Reservation Code
        </Button>
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
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading reservations...</div>
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6" />}
          title="No Reservations In This Tab"
          description="There are currently no customer holds with this status."
        />
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <ReservationItemRow
              key={res._id}
              reservation={res}
              onRefresh={fetchReservations}
            />
          ))}
        </div>
      )}

      {/* Code Verification Modal */}
      <ReservationVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccessAction={fetchReservations}
      />
    </div>
  );
};
