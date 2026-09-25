import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await loginAdmin({ email, password });
      navigate('/admin/dashboard');
    } catch (err) {
      // handled by context toast
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo.admin@nearstyle.com');
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 font-black text-xl">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Administrator Gateway
          </h1>
          <p className="text-xs text-slate-500">
            Platform governance, store approval queue, and system-wide metrics.
          </p>
        </div>

        {/* Demo Admin Autofill */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-rose-900 block">Demo Admin Account</span>
            <span className="text-[11px] text-rose-700">demo.admin@nearstyle.com</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            Auto Fill
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@nearstyle.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Master Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="danger"
            size="lg"
            className="w-full font-bold shadow-md"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate Admin Session
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          <Link to="/" className="text-slate-500 hover:text-slate-800">
            ← Return to Marketplace Home
          </Link>
        </div>
      </div>
    </div>
  );
};
