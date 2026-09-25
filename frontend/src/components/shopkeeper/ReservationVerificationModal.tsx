import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, Clock, User, Phone, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useCountdown } from '../../hooks/useCountdown';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ReservationVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAction?: () => void;
}

export const ReservationVerificationModal: React.FC<ReservationVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccessAction,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reservation, setReservation] = useState<any | null>(null);
  const { success, error } = useToast();

  const countdown = useCountdown(reservation?.expiresAt);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setLoading(true);
      const res = await api.post('/reservations/verify', { code: code.trim() });
      setReservation(res.data);
    } catch (err: any) {
      error(err.message || 'No reservation found with this code.');
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPurchased = async () => {
    if (!reservation) return;
    try {
      setActionLoading(true);
      await api.post(`/reservations/${reservation._id}/purchase`);
      success('Customer purchase verified! Inventory permanently updated.');
      if (onSuccessAction) onSuccessAction();
      handleClose();
    } catch (err: any) {
      error(err.message || 'Failed to complete purchase.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!reservation) return;
    try {
      setActionLoading(true);
      await api.post(`/reservations/${reservation._id}/release`);
      success('Reservation released back to store stock.');
      if (onSuccessAction) onSuccessAction();
      handleClose();
    } catch (err: any) {
      error(err.message || 'Failed to release reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setReservation(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Verify Customer Reservation"
      description="Enter the customer's 8-hour reservation code (e.g. NS-RES-10245)."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="NS-RES-XXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm uppercase tracking-wider font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Verify
          </Button>
        </form>

        {/* Reservation details */}
        {reservation && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-500">Code</span>
                <p className="text-base font-black text-brand-600 tracking-wide">
                  {reservation.reservationCode}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-500">Status</span>
                <p
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                    reservation.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : reservation.status === 'COMPLETED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {reservation.status}
                </p>
              </div>
            </div>

            {/* Product & Size */}
            <div className="flex items-center gap-3">
              <img
                src={reservation.productId?.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                alt=""
                className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {reservation.productId?.name}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Size: <strong className="text-brand-600">{reservation.size}</strong> • Colour: {reservation.colour}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <p className="flex items-center gap-2 text-slate-800 font-semibold">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{reservation.customerId?.name || 'Customer'}</span>
              </p>
              {reservation.customerId?.phone && (
                <p className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{reservation.customerId?.phone}</span>
                </p>
              )}
            </div>

            {/* Countdown Remaining */}
            {reservation.status === 'ACTIVE' && (
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Hold Remaining:
                </span>
                <span>{countdown.formatted}</span>
              </div>
            )}

            {/* Action Buttons */}
            {reservation.status === 'ACTIVE' ? (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleRelease}
                  isLoading={actionLoading}
                  className="text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Release Hold
                </Button>
                <Button
                  variant="success"
                  size="md"
                  onClick={handleMarkPurchased}
                  isLoading={actionLoading}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Mark Purchased
                </Button>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-1 font-medium">
                This reservation has already been {reservation.status.toLowerCase()}.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
