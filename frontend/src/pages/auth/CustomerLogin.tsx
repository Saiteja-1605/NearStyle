import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const CustomerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await loginCustomer({ email, password });
      navigate('/');
    } catch (err) {
      // handled by context toast
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo.customer@nearstyle.com');
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100 font-black text-xl">
            NS
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Discover nearby fashion boutiques and reserve outfits to try in store.
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-brand-900 block">College Demo Customer</span>
            <span className="text-[11px] text-brand-700">demo.customer@nearstyle.com</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            Auto Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
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
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Footer Links */}
        <div className="pt-2 text-center text-xs text-slate-500 space-y-2 border-t border-slate-100">
          <p>
            Don't have an account yet?{' '}
            <Link to="/customer/register" className="font-bold text-brand-600 hover:underline">
              Register as Customer
            </Link>
          </p>
          <p>
            Are you a store owner?{' '}
            <Link to="/shopkeeper/login" className="font-bold text-amber-600 hover:underline">
              Shopkeeper Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
