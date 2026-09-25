import React from 'react';
import { X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button } from '../common/Button';

export interface FilterState {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
  size: string;
  colour: string;
  maxDistance: string;
  availableOnly: boolean;
  sort: string;
}

interface FilterDrawerProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobileModal?: boolean;
}

const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Accessories'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];
const COLOURS = ['All', 'Black', 'White', 'Blue', 'Navy Blue', 'Olive Green', 'Burgundy', 'Mustard'];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
  onChange,
  onReset,
  isOpen = true,
  onClose,
  isMobileModal = false,
}) => {
  const update = (key: keyof FilterState, val: any) => {
    onChange({ ...filters, [key]: val });
  };

  const content = (
    <div className="space-y-6">
      {/* Category Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => update('category', cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filters.category === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Size
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {SIZES.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => update('size', sz)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filters.size === sz
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Price Range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => update('minPrice', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => update('maxPrice', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Colour */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Colour
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COLOURS.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => update('colour', col)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                filters.colour === col
                  ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Max Distance Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Max Distance: {filters.maxDistance ? `${filters.maxDistance} km` : 'Any distance'}
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={filters.maxDistance || '30'}
          onChange={(e) => update('maxDistance', e.target.value === '30' ? '' : e.target.value)}
          className="w-full accent-brand-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>1 km</span>
          <span>15 km</span>
          <span>Any</span>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => update('availableOnly', e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
          />
          <span className="text-xs font-semibold text-slate-800 select-none">
            Only show in-stock products
          </span>
        </label>
      </div>

      {/* Clear Filters CTA */}
      <div className="pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full text-xs font-semibold text-slate-600"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  // If Mobile Drawer Modal
  if (isMobileModal) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-xs bg-white p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">Filter Catalog</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Static Sidebar
  return (
    <aside className="w-64 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24 self-start">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-sm text-slate-900">Filters</h3>
        </div>
      </div>
      {content}
    </aside>
  );
};
