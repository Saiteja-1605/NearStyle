import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Lock, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const ShopkeeperRegister: React.FC = () => {
  const { registerShopkeeper } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [area, setArea] = useState('Bandra');
  const [openingTime, setOpeningTime] = useState('10:00 AM');
  const [closingTime, setClosingTime] = useState('09:30 PM');
  const [image, setImage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await registerShopkeeper({
        name,
        email,
        password,
        phone,
        storeName,
        address,
        city,
        area,
        openingTime,
        closingTime,
        image: image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
        categories: ['Men', 'Women', 'Casual'],
      });
      navigate('/shopkeeper/dashboard');
    } catch (err) {
      // handled by context toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 font-black text-xl">
            <Store className="w-6 h-6 text-amber-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Register Your Fashion Store
          </h1>
          <p className="text-xs text-slate-500">
            Reach local shoppers, boost store footfall, and enable 8-hour Reserve & Try holds.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Owner & Account Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Owner Full Name"
              placeholder="e.g. Rajesh Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Account Email"
              type="email"
              placeholder="owner@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Contact Phone"
              placeholder="+91 98201 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="Account Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 pt-2">
            Store Physical Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Store Trade Name"
                placeholder="e.g. Trendy Threads Boutique"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                leftIcon={<Store className="w-4 h-4" />}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Physical Address / Shop Number"
                placeholder="e.g. Shop 12, Linking Road, Near KFC"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label="City"
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <Input
              label="Area / Neighborhood"
              placeholder="Bandra"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
            />

            <Input
              label="Opening Time"
              placeholder="10:00 AM"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            />

            <Input
              label="Closing Time"
              placeholder="09:30 PM"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              leftIcon={<Clock className="w-4 h-4" />}
            />
          </div>

          <div className="pt-2">
            <Input
              label="Store Banner Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              helperText="Leave empty to use a stylish default retail storefront image."
            />
          </div>

          <Button
            type="submit"
            variant="dark"
            size="lg"
            className="w-full font-bold shadow-md bg-navy-900 hover:bg-navy-950 mt-4"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Register Store & Open Merchant Portal
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/shopkeeper/login" className="font-bold text-amber-700 hover:underline">
            Sign In to Store
          </Link>
        </div>
      </div>
    </div>
  );
};
