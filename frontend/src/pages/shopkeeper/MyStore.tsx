import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Clock, Image as ImageIcon, Check, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { IStore } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

export const MyStore: React.FC = () => {
  const [store, setStore] = useState<IStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [image, setImage] = useState('');
  const [allowsReservation, setAllowsReservation] = useState(true);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stores/my-store');
      const s: IStore = res.data;
      setStore(s);
      setName(s.name);
      setDescription(s.description || '');
      setPhone(s.phone);
      setAddress(s.address);
      setCity(s.city);
      setArea(s.area);
      setOpeningTime(s.openingTime);
      setClosingTime(s.closingTime);
      setImage(s.image);
      setAllowsReservation(s.allowsReservation !== false);
    } catch (err: any) {
      console.warn('Could not load store', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/stores/my-store', {
        name,
        description,
        phone,
        address,
        city,
        area,
        openingTime,
        closingTime,
        image,
        allowsReservation,
      });

      setStore(res.data.store);
      success('Store profile updated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update store profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-16 text-center text-xs text-slate-400">Loading store profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
            Merchant Settings
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Store Profile & Location
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your storefront details, contact number, opening hours, and Reserve & Try preferences.
          </p>
        </div>

        {store && (
          <Link
            to={`/stores/${store._id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors shrink-0"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview Public Storefront</span>
          </Link>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Banner Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Storefront Banner
          </label>
          <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'}
              alt="Storefront"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-3">
            <Input
              label="Banner Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              leftIcon={<ImageIcon className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Input
            label="Store Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<Store className="w-4 h-4" />}
            required
          />

          <Input
            label="Contact Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Store Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about your specialties and styles..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Street Address / Shop Number"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
              required
            />
          </div>

          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />

          <Input
            label="Area / Neighborhood"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />

          <Input
            label="Opening Time"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
          />

          <Input
            label="Closing Time"
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
          />
        </div>

        {/* Reserve & Try Toggle */}
        <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-start justify-between gap-4">
          <div>
            <span className="font-bold text-sm text-brand-900 block">
              Enable Reserve & Try Feature
            </span>
            <p className="text-xs text-brand-700 mt-1 max-w-lg leading-relaxed">
              When enabled, customers can hold any available product size at your store for 8 hours with zero advance fee and come in person to try it on.
            </p>
          </div>
          <input
            type="checkbox"
            checked={allowsReservation}
            onChange={(e) => setAllowsReservation(e.target.checked)}
            className="w-5 h-5 text-brand-600 focus:ring-brand-500 rounded border-slate-300 mt-1 cursor-pointer"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            variant="dark"
            size="md"
            className="font-bold bg-navy-900 hover:bg-navy-950"
            isLoading={saving}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Save Store Details
          </Button>
        </div>
      </form>
    </div>
  );
};
