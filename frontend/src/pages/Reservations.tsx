import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  XCircle,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { IReservation } from '../types';
import api from '../services/api';
import { useCountdown } from '../hooks/useCountdown';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

// Helper component for active reservation with live countdown
const ActiveReservationCard: React.FC<{
  reservation: IReservation;
  onCancel: (id: string) => void;
  cancellingId: string | null;
}> = ({ reservation, onCancel, cancellingId }) => {
  const countdown = useCountdown(reservation.expiresAt);
  const store = typeof reservation.storeId === 'object' ? reservation.storeId : null;
  const product = typeof reservation.productId === 'object' ? reservation.productId : null;

  const handleDirections = () => {
    if (!store) return;
    const query = encodeURIComponent(`${store.name}, ${store.address}, ${store.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const isExpiringSoon = countdown.hours === 0 && countdown.minutes < 60;

  return (
    <div className="bg-white rounded-3xl border border-brand-200/80 p-6 sm:p-7 shadow-md space-y-6 relative overflow-hidden">
      {/* Top Accent Ribbon */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Reservation Code
          </span>
          <p className="text-xl sm:text-2xl font-black text-brand-600 tracking-wider mt-0.5">
            {reservation.reservationCode}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Show this verification code to the shopkeeper at the counter.
          </p>
        </div>

        {/* Live Countdown Badge */}
        <div
          className={`p-3 rounded-2xl border text-center shrink-0 ${
            countdown.isExpired
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isExpiringSoon
              ? 'bg-amber-50 border-amber-200 text-amber-900 animate-pulse'
              : 'bg-brand-50/80 border-brand-200 text-brand-900'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider block">
            {countdown.isExpired ? 'Reservation Ended' : 'Time Remaining to Try'}
          </span>
          <p className="text-lg font-black tracking-tight mt-0.5 font-mono">
            {countdown.formatted}
          </p>
          <span className="text-[10px] text-slate-500 block">
            Expires: {new Date(reservation.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Item & Store Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Details */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <img
            src={product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
            alt=""
            className="w-16 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              Reserved Item
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {product?.name || 'Fashion Item'}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                Size: {reservation.size}
              </span>
              <span>Colour: {reservation.colour}</span>
            </div>
            <p className="text-xs font-black text-slate-900 mt-1.5">
              ₹{((product?.discountPrice || product?.price) || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Store Location Details */}
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Store Location
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              {store?.name || 'Local Store'}
            </h4>
            <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
              <span>{store?.address}, {store?.area}, {store?.city}</span>
            </p>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Hours: {store?.openingTime} - {store?.closingTime}</span>
            <button
              onClick={handleDirections}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" /> Directions
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Locked physical inventory. Zero charge unless you buy in person.</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(reservation._id)}
          isLoading={cancellingId === reservation._id}
          className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 w-full sm:w-auto"
          leftIcon={<XCircle className="w-3.5 h-3.5" />}
        >
          Cancel Reservation
        </Button>
      </div>
    </div>
  );
};

export const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservations/my');
      setReservations(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch reservations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The held item will immediately return to store inventory.')) {
      return;
    }

    try {
      setCancellingId(id);
      await api.post(`/reservations/${id}/cancel`);
      success('Reservation cancelled. Held stock has been released.');
      fetchReservations();
    } catch (err: any) {
      error(err.message || 'Could not cancel reservation.');
    } finally {
      setCancellingId(null);
    }
  };

  const activeReservations = reservations.filter((r) => r.status === 'ACTIVE');
  const pastReservations = reservations.filter((r) => r.status !== 'ACTIVE');

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-400">
        Loading reservations...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
          Reserve & Try Status
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          My In-Store Reservations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Items held in store for you for 8 hours. Try them in the dressing room before you buy!
        </p>
      </div>

      {/* Active Reservations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Holds ({activeReservations.length})
          </h2>
        </div>

        {activeReservations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-3">
            <Clock className="w-10 h-10 text-brand-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">No Active Reservations</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Find an outfit at a nearby store and click <strong>Reserve & Try</strong> to hold it for 8 hours without paying upfront.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/products')}
              className="mt-2"
            >
              Explore Products to Reserve
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {activeReservations.map((res) => (
              <ActiveReservationCard
                key={res._id}
                reservation={res}
                onCancel={handleCancel}
                cancellingId={cancellingId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past / Completed Reservations */}
      {pastReservations.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Past Reservations History
          </h2>

          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 p-2">
            {pastReservations.map((res) => {
              const product = typeof res.productId === 'object' ? res.productId : null;
              const store = typeof res.storeId === 'object' ? res.storeId : null;

              return (
                <div key={res._id} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                      alt=""
                      className="w-10 h-12 object-cover rounded-lg border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{product?.name || 'Item'}</p>
                      <p className="text-slate-500 text-[11px]">
                        {store?.name} • Code: {res.reservationCode} • Size {res.size}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-bold px-2.5 py-1 rounded-full text-[11px] shrink-0 border ${
                      res.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : res.status === 'EXPIRED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
