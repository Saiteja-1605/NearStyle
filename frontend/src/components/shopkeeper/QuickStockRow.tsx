import React, { useState } from 'react';
import { Minus, Plus, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { IProduct, ISizeStock } from '../../types';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface QuickStockRowProps {
  product: IProduct;
  onUpdated: () => void;
}

export const QuickStockRow: React.FC<QuickStockRowProps> = ({ product, onUpdated }) => {
  const { success, error } = useToast();
  const [loadingSize, setLoadingSize] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const handleStockDelta = async (size: string, delta: number) => {
    try {
      setLoadingSize(size);
      await api.patch(`/inventory/${product._id}/size`, {
        size,
        delta,
      });
      success(`Updated ${product.name} (Size ${size})`);
      onUpdated();
    } catch (err: any) {
      error(err.message || 'Failed to update stock');
    } finally {
      setLoadingSize(null);
    }
  };

  const handleToggleAvailable = async () => {
    try {
      setIsToggling(true);
      await api.patch(`/inventory/${product._id}/toggle-availability`);
      success(`Status toggled for ${product.name}`);
      onUpdated();
    } catch (err: any) {
      error(err.message || 'Failed to toggle status');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Product Details */}
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-16 object-cover rounded-xl shrink-0 border border-slate-100"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {product.category} • ₹{(product.discountPrice || product.price).toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  product.isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}
              >
                {product.isAvailable ? 'Active' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Sizes & Inventory Steppers */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {product.sizes.map((s) => {
            const isUpdating = loadingSize === s.size;
            const available = s.quantity - (s.reserved || 0);
            const isLow = available <= 2;

            return (
              <div
                key={s.size}
                className={`flex items-center gap-2 p-1.5 rounded-xl border ${
                  isLow ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-center px-1">
                  <span className="block text-[10px] font-extrabold text-slate-700 uppercase">
                    {s.size}
                  </span>
                  <span
                    className={`block text-xs font-black leading-tight ${
                      isLow ? 'text-amber-700' : 'text-slate-900'
                    }`}
                  >
                    {s.quantity}
                  </span>
                  {s.reserved > 0 && (
                    <span className="block text-[9px] text-brand-600 font-semibold leading-none">
                      ({s.reserved} res)
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStockDelta(s.size, 1)}
                    className="p-1 rounded bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-2xs border border-slate-200 disabled:opacity-50 transition-colors"
                    title="Add 1 unit"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating || s.quantity <= (s.reserved || 0)}
                    onClick={() => handleStockDelta(s.size, -1)}
                    className="p-1 rounded bg-white text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-2xs border border-slate-200 disabled:opacity-50 transition-colors"
                    title="Remove 1 unit"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Out of Stock / Available Quick Toggle */}
          <button
            type="button"
            disabled={isToggling}
            onClick={handleToggleAvailable}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              product.isAvailable
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={product.isAvailable ? 'Hide from store' : 'Make available in store'}
          >
            {product.isAvailable ? (
              <>
                <EyeOff className="w-4 h-4 text-slate-500" />
                <span className="hidden lg:inline text-xs">Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline text-xs">Publish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
