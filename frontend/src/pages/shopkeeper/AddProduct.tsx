import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Image as ImageIcon, Check } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];
const CATEGORIES = ['Men', 'Women', 'Kids', 'Footwear', 'Accessories'];
const SUBCATEGORIES = [
  'Shirts',
  'T-Shirts',
  'Jeans',
  'Dresses',
  'Kurtas',
  'Sarees',
  'Shoes',
  'Jackets',
  'Trousers',
  'Accessories',
];

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('NearStyle Select');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Men');
  const [subcategory, setSubcategory] = useState('Shirts');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Colours
  const [colors, setColors] = useState<string[]>(['Black']);
  const [newColorInput, setNewColorInput] = useState('');

  // Selected sizes and their individual inventory
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({
    M: 5,
    L: 5,
  });

  const handleToggleSize = (sz: string) => {
    setSizeStock((prev) => {
      const next = { ...prev };
      if (next[sz] !== undefined) {
        delete next[sz];
      } else {
        next[sz] = 3; // Default 3 units
      }
      return next;
    });
  };

  const handleQuantityChange = (sz: string, val: string) => {
    const qty = Math.max(0, parseInt(val, 10) || 0);
    setSizeStock((prev) => ({ ...prev, [sz]: qty }));
  };

  const handleAddColor = () => {
    if (newColorInput.trim() && !colors.includes(newColorInput.trim())) {
      setColors([...colors, newColorInput.trim()]);
      setNewColorInput('');
    }
  };

  const handleRemoveColor = (col: string) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((c) => c !== col));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      error('Product name and price are required.');
      return;
    }

    const sizesArray = Object.entries(sizeStock).map(([size, quantity]) => ({
      size,
      quantity,
    }));

    if (sizesArray.length === 0) {
      error('Please select at least one size for this product.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/products', {
        name,
        brand,
        description,
        category,
        subcategory,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : Number(price),
        images: imageUrl
          ? [imageUrl]
          : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
        colors,
        sizes: sizesArray,
        reservationEligible: true,
      });

      success('Product published successfully!');
      navigate('/shopkeeper/products');
    } catch (err: any) {
      error(err.message || 'Failed to publish product.');
    } finally {
      setLoading(false);
    }
  };

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
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Inventory Expansion
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            + Add New Product to Store
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify sizes, colors, and physical stock quantity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <Input
              label="Product Title"
              placeholder="e.g. Slim-Fit Linen Oxford Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Brand Name"
                placeholder="e.g. NearStyle Select"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subcategory
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {SUBCATEGORIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Original Price (₹)"
                type="number"
                placeholder="1999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />

              <Input
                label="Selling / Discounted Price (₹)"
                type="number"
                placeholder="1499 (Optional)"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                helperText="Leave empty to use original price."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Product Description
              </label>
              <textarea
                rows={3}
                placeholder="Fabric composition, fit, care instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>

            <Input
              label="Product Image URL"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              helperText="Paste an image URL, or leave blank to use a stylish placeholder."
              leftIcon={<ImageIcon className="w-4 h-4" />}
            />
          </div>

          {/* Colours */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Available Colours
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
                  placeholder="New Colour..."
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg w-28 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                Sizes & Initial Stock Quantities
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
                          ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? `✓ ${sz}` : `+ ${sz}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inventory table for selected sizes */}
            {Object.keys(sizeStock).length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Set Initial Stock per Size
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              </div>
            )}
          </div>

          {/* Submit */}
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
              isLoading={loading}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Publish Product to Store
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
