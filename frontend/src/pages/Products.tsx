import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { IProduct } from '../types';
import api from '../services/api';
import { ProductCard } from '../components/customer/ProductCard';
import { FilterDrawer, FilterState } from '../components/customer/FilterDrawer';
import { ReserveModal } from '../components/customer/ReserveModal';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { useLocation } from '../context/LocationContext';

const INITIAL_FILTERS: FilterState = {
  category: 'All',
  subcategory: 'All',
  minPrice: '',
  maxPrice: '',
  size: 'All',
  colour: 'All',
  maxDistance: '',
  availableOnly: false,
  sort: 'newest',
};

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userCoords, selectedLocation } = useLocation();

  const [filters, setFilters] = useState<FilterState>(() => ({
    category: searchParams.get('category') || 'All',
    subcategory: searchParams.get('subcategory') || 'All',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || 'All',
    colour: searchParams.get('colour') || 'All',
    maxDistance: searchParams.get('maxDistance') || '',
    availableOnly: searchParams.get('availableOnly') === 'true',
    sort: searchParams.get('sort') || 'newest',
  }));

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [reservingProduct, setReservingProduct] = useState<IProduct | null>(null);

  const searchQuery = searchParams.get('search') || '';

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.category !== 'All') params.append('category', filters.category);
      if (filters.subcategory !== 'All') params.append('subcategory', filters.subcategory);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.size !== 'All') params.append('size', filters.size);
      if (filters.colour !== 'All') params.append('colour', filters.colour);
      if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
      if (filters.availableOnly) params.append('availableOnly', 'true');
      if (filters.sort) params.append('sort', filters.sort);

      // Coordinates for distance calculations
      if (userCoords) {
        params.append('lat', userCoords.lat.toString());
        params.append('lng', userCoords.lng.toString());
      }

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, searchQuery, userCoords]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Cross-Store Marketplace
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {searchQuery ? `Results for "${searchQuery}"` : 'Browse Fashion Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing available styles from verified local stores in {selectedLocation.area}, {selectedLocation.city}
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden text-xs font-bold text-slate-700"
            onClick={() => setMobileFilterOpen(true)}
            leftIcon={<SlidersHorizontal className="w-4 h-4 text-brand-600" />}
          >
            Filters
          </Button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="nearest">Nearest Store</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="flex items-start gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block shrink-0">
          <FilterDrawer
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer Modal */}
        <FilterDrawer
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          isMobileModal={true}
        />

        {/* Product Grid Area */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No Products Found"
              description="We couldn't find any fashion items matching your selected filters. Try broadening your criteria."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onOpenReserve={(p) => setReservingProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Reserve Modal */}
      <ReserveModal
        product={reservingProduct}
        isOpen={Boolean(reservingProduct)}
        onClose={() => setReservingProduct(null)}
      />
    </div>
  );
};
