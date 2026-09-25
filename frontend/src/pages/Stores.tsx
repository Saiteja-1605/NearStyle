import React, { useState, useEffect } from 'react';
import { Search, MapPin, Store as StoreIcon } from 'lucide-react';
import { IStore } from '../types';
import api from '../services/api';
import { StoreCard } from '../components/customer/StoreCard';
import { StoreCardSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { useLocation, PRESET_LOCATIONS } from '../context/LocationContext';

export const Stores: React.FC = () => {
  const { selectedLocation, userCoords } = useLocation();
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(selectedLocation.city);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const coords = userCoords ? `&lat=${userCoords.lat}&lng=${userCoords.lng}` : '';
      const cityQuery = selectedCity && selectedCity !== 'All' ? `&city=${selectedCity}` : '';
      const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';

      const res = await api.get(`/stores?${cityQuery}${coords}${searchQuery}`);
      setStores(res.data || []);
    } catch (err) {
      console.warn('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [selectedCity, userCoords]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStores();
  };

  const cities = ['All', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Local Boutiques
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Discover Nearby Fashion Stores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified physical stores in your area. Walk in to try your reserved styles!
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search store name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Find
          </button>
        </form>
      </div>

      {/* City Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 mr-2 shrink-0">City:</span>
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCity(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCity === c
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Store Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StoreCardSkeleton />
          <StoreCardSkeleton />
          <StoreCardSkeleton />
          <StoreCardSkeleton />
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          icon={<StoreIcon className="w-6 h-6" />}
          title="No Stores Found"
          description="We couldn't find any fashion stores matching your criteria. Try changing the city or search term."
          actionText="Show All Cities"
          onAction={() => setSelectedCity('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => (
            <StoreCard key={store._id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
};
