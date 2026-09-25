import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const ShopkeeperLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginShopkeeper } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await loginShopkeeper({ email, password });
      navigate('/shopkeeper/dashboard');
    } catch (err) {
      // handled by context toast
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo.shopkeeper@nearstyle.com');
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 font-black text-xl">
            <Store className="w-6 h-6 text-amber-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Shopkeeper Merchant Portal
          </h1>
          <p className="text-xs text-slate-500">
            Log in to manage your inventory, products, orders, and verify Reserve & Try holds.
          </p>
        </div>

        {/* Demo Shopkeeper Autofill */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-amber-900 block">Demo Shopkeeper (Fashion Hub)</span>
            <span className="text-[11px] text-amber-700">demo.shopkeeper@nearstyle.com</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            Auto Fill
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Shopkeeper Email"
            type="email"
            placeholder="store@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="dark"
            size="lg"
            className="w-full font-bold shadow-md bg-navy-900 hover:bg-navy-950"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Access Merchant Dashboard
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-2 border-t border-slate-100">
          <p>
            Want to list your fashion store?{' '}
            <Link to="/shopkeeper/register" className="font-bold text-amber-700 hover:underline">
              Register New Store
            </Link>
          </p>
          <p>
            Looking to buy outfits?{' '}
            <Link to="/customer/login" className="font-bold text-brand-600 hover:underline">
              Customer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
