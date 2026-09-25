import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, Search, RefreshCw, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IProduct } from '../../types';
import api from '../../services/api';
import { QuickStockRow } from '../../components/shopkeeper/QuickStockRow';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [prodsRes, lowRes] = await Promise.all([
        api.get('/products/shopkeeper/my-products'),
        api.get('/inventory/low-stock'),
      ]);
      setProducts(prodsRes.data || []);
      setLowStockItems(lowRes.data || []);
    } catch (err) {
      console.warn('Could not load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Fast Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Quick Inventory Updater
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Instantly increment or decrement stock without opening the full product editor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInventoryData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Link to="/shopkeeper/products/add">
            <Button
              variant="primary"
              size="sm"
              className="font-bold"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Low Stock Warnings ({lowStockItems.length} items with ≤ 2 units remaining)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {lowStockItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.image}
                    alt=""
                    className="w-10 h-12 object-cover rounded-lg shrink-0 border border-slate-100"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                    <p className="text-amber-800 font-semibold text-[11px]">
                      Size: <strong>{item.size}</strong> • Only {item.available} left!
                    </p>
                  </div>
                </div>

                <Link
                  to={`/shopkeeper/products/edit/${item.productId}`}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] shrink-0 transition-colors"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter products to adjust inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Quick Stock Rows */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading inventory rows...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6" />}
          title="No Products to Manage"
          description="You have no products listed under this search."
          actionText="Add Product"
          actionHref="/shopkeeper/products/add"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <QuickStockRow
              key={product._id}
              product={product}
              onUpdated={fetchInventoryData}
            />
          ))}
        </div>
      )}
    </div>
  );
};
