import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { IProduct } from '../../types';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const ShopkeeperProducts: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/shopkeeper/my-products');
      setProducts(res.data || []);
    } catch (err) {
      console.warn('Could not load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your store catalog?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/products/${id}`);
      success(`Product "${name}" deleted.`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Store Products ({products.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage product descriptions, sizes, pricing, and visibility.
          </p>
        </div>

        {/* Large Prominent Add Product Button */}
        <Link to="/shopkeeper/products/add">
          <Button
            variant="primary"
            size="lg"
            className="font-bold shadow-md bg-brand-600 hover:bg-brand-700 text-sm"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            + Add New Product
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products in your catalog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Product List / Table */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title={search ? 'No Matching Products' : 'No Products Listed Yet'}
          description={
            search
              ? 'No products matched your search term.'
              : 'Add your first fashion item to start receiving customer orders and in-store fitting reservations.'
          }
          actionText="+ Add Product Now"
          onAction={() => window.location.assign('/shopkeeper/products/add')}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {filteredProducts.map((p) => {
              const totalStock = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
              const totalReserved = p.sizes.reduce((sum, s) => sum + (s.reserved || 0), 0);

              return (
                <div
                  key={p._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Image & Title */}
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-14 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {p.category} • {p.subcategory}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.isAvailable ? 'Published' : 'Hidden'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {p.name}
                      </h4>

                      <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                        {p.sizes.map((s) => (
                          <span
                            key={s.size}
                            className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-semibold text-slate-700"
                          >
                            {s.size}: {s.quantity} {s.reserved > 0 && `(${s.reserved} res)`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">
                        ₹{(p.discountPrice || p.price).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {totalStock} in stock • {totalReserved} reserved
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/shopkeeper/products/edit/${p._id}`}>
                        <button
                          type="button"
                          className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 border border-slate-200 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(p._id, p.name)}
                        disabled={deletingId === p._id}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
