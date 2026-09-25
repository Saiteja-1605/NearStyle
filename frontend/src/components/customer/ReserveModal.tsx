import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Store, MapPin, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { IProduct } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ReserveModalProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: string;
  selectedColour?: string;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  product,
  isOpen,
  onClose,
  selectedSize: initialSize,
  selectedColour: initialColour,
}) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [size, setSize] = useState<string>(initialSize || '');
  const [colour, setColour] = useState<string>(initialColour || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [createdReservation, setCreatedReservation] = useState<any | null>(null);

  // Sync state if initial props change
  React.useEffect(() => {
    if (product) {
      if (initialSize) setSize(initialSize);
      else if (product.sizes.length > 0) setSize(product.sizes[0].size);

      if (initialColour) setColour(initialColour);
      else if (product.colors.length > 0) setColour(product.colors[0]);
    }
    setCreatedReservation(null);
  }, [product, initialSize, initialColour]);

  if (!product) return null;

  const store = typeof product.storeId === 'object' ? product.storeId : null;
  const storeName = store ? store.name : 'Store';
  const storeAddress = store ? `${store.address}, ${store.area}` : '';

  const activeSizeStock = product.sizes.find((s) => s.size === size);
  const availableInSelected = activeSizeStock
    ? Math.max(0, activeSizeStock.quantity - (activeSizeStock.reserved || 0))
    : 0;

  const handleConfirmReservation = async () => {
    if (!user) {
      info('Please sign in as a customer to reserve items.');
      navigate('/customer/login');
      return;
    }

    if (!size || !colour) {
      error('Please select both size and colour.');
      return;
    }

    if (availableInSelected < 1) {
      error(`Size ${size} is currently out of stock or fully reserved.`);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/reservations', {
        productId: product._id,
        size,
        colour,
      });

      setCreatedReservation(res.data.reservation);
      success('Reservation confirmed! Held for 8 hours.');
    } catch (err: any) {
      error(err.message || 'Could not create reservation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedReservation(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdReservation ? 'Reservation Confirmed!' : 'Reserve & Try in Store'}
      description={
        createdReservation
          ? 'Show this code when visiting the store.'
          : 'Hold this item at the store for 8 hours. Try before you pay!'
      }
      maxWidth="md"
    >
      {createdReservation ? (
        <div className="space-y-5 pt-2 text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Reservation Code</span>
              <span className="text-base font-extrabold text-brand-600 tracking-wider">
                {createdReservation.reservationCode}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Item</span>
              <span className="font-bold text-slate-800">{product.name} ({size})</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Store</span>
              <span className="font-semibold text-slate-800">{storeName}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200 pt-2 text-rose-600 font-bold">
              <span>Hold Duration</span>
              <span>8 Hours Remaining</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={handleClose}
            >
              Continue Browsing
            </Button>
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => {
                handleClose();
                navigate('/reservations');
              }}
            >
              View Active Reservations
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Product Mini Preview */}
          <div className="flex gap-3.5 items-center p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-14 h-16 object-cover rounded-lg shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{storeName}</p>
              <p className="text-xs font-extrabold text-brand-600 mt-1">
                ₹{(product.discountPrice || product.price).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span>Select Size</span>
              {activeSizeStock && (
                <span className={availableInSelected > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {availableInSelected > 0 ? `${availableInSelected} units available` : 'Out of stock'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const avail = s.quantity - (s.reserved || 0);
                const isSelected = size === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={avail <= 0}
                    onClick={() => setSize(s.size)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-400'
                        : avail > 0
                        ? 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                        : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colour Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Colour
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    colour === c
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Reserve Policy Highlight */}
          <div className="bg-brand-50/70 border border-brand-100 rounded-xl p-3 space-y-1.5 text-xs text-brand-900">
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>8-Hour Hold Policy</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              We lock this physical inventory for you. No credit card or upfront charge needed. Visit {storeName} within 8 hours to try it on!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <Button variant="outline" size="md" className="w-1/3" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              className="w-2/3"
              onClick={handleConfirmReservation}
              isLoading={isLoading}
              disabled={availableInSelected < 1}
            >
              Confirm 8-Hour Reservation
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
