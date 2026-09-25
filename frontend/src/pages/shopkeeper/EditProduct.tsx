import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Plus, X, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { IProduct } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('');
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const p: IProduct = res.data;
        setName(p.name);
        setBrand(p.brand);
        setDescription(p.description || '');
        setCategory(p.category);
        setSubcategory(p.subcategory);
        setPrice(p.price.toString());
        setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
        setImageUrl(p.images[0] || '');
        setColors(p.colors || ['Black']);
        setIsAvailable(p.isAvailable);

        const sizesMap: Record<string, number> = {};
        p.sizes.forEach((s) => {
          sizesMap[s.size] = s.quantity;
        });
        setSizeStock(sizesMap);
      } catch (err) {
        console.warn('Failed to load product for editing', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleToggleSize = (sz: string) => {
    setSizeStock((prev) => {
      const next = { ...prev };
      if (next[sz] !== undefined) {
        delete next[sz];
      } else {
        next[sz] = 1;
      }
      return next;
    });
  };

  const handleQuantityChange = (sz: string, val: string) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setSizeStock((prev) => ({ ...prev, [sz]: qty }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor('');
    }
  };

  const handleRemoveColor = (col: string) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((c) => c !== col));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const sizesArray = Object.entries(sizeStock).map(([size, quantity]) => ({
      size,
      quantity,
    }));

    if (sizesArray.length === 0) {
      error('Please specify at least one size.');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/products/${id}`, {
        name,
        brand,
        description,
        category,
        subcategory,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : Number(price),
        images: imageUrl ? [imageUrl] : undefined,
        colors,
        sizes: sizesArray,
        isAvailable,
      });

      success('Product updated successfully!');
      navigate('/shopkeeper/products');
    } catch (err: any) {
      error(err.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-xs text-slate-400">Loading product editor...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/shopkeeper/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            Product Modification
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Edit Product Details
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Updates will reflect immediately in the customer-facing marketplace.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Input
            label="Product Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <Input
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Original Price (₹)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <Input
              label="Discount Price (₹)"
              type="number"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          <Input
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            leftIcon={<ImageIcon className="w-4 h-4" />}
          />

          {/* Colours */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Colours
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {colors.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-800 text-xs px-3 py-1 rounded-xl font-bold border border-brand-200"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(c)}
                    className="text-brand-500 hover:text-brand-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="New..."
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg w-24"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sizes and Inventory Count */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((sz) => {
                  const isChecked = sizeStock[sz] !== undefined;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isChecked
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? `✓ ${sz}` : `+ ${sz}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {Object.keys(sizeStock).length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(sizeStock).map(([sz, qty]) => (
                  <div key={sz} className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="block text-xs font-black text-slate-700 uppercase">
                      Size {sz}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => handleQuantityChange(sz, e.target.value)}
                      className="w-full mt-1 px-2 py-1 text-sm font-bold border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-900 block">Product Catalog Visibility</span>
              <p className="text-xs text-slate-500">
                {isAvailable ? 'This item is publicly visible to customers.' : 'Hidden from customer catalog.'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-5 h-5 text-brand-600 rounded border-slate-300 cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/shopkeeper/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="font-bold shadow-md"
              isLoading={saving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
