import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, MapPin, Store, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 text-sm border-t border-navy-900 mt-20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-navy-900/60 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Reserve & Try (8 Hours)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Find an outfit online, hold it at your local store for 8 hours, and try before paying.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Local Fashion Discovery</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Connect with independent boutiques and fashion hubs in your immediate neighborhood.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Empowering Local Stores</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Shopkeepers can list inventory in minutes and capture footfall with verified in-store visits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-white font-black text-sm">
                <span className="text-brand-400">N</span>
                <span className="text-white">S</span>
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                Near<span className="text-brand-400">Style</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Discover Nearby. Try Before You Buy. The hyper-local fashion marketplace connecting buyers with nearby stores.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>as a College Capstone Project</span>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Customers</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/stores" className="hover:text-white transition-colors">Nearby Stores</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Fashion Catalog</Link></li>
              <li><Link to="/reservations" className="hover:text-white transition-colors">Reserve & Try Status</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
              <li><Link to="/customer/login" className="hover:text-white transition-colors">Customer Login</Link></li>
            </ul>
          </div>

          {/* Shopkeeper */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Shopkeepers</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shopkeeper/register" className="hover:text-white transition-colors">Register Your Store</Link></li>
              <li><Link to="/shopkeeper/login" className="hover:text-white transition-colors">Merchant Portal</Link></li>
              <li><Link to="/shopkeeper/inventory" className="hover:text-white transition-colors">Quick Stock Updater</Link></li>
              <li><Link to="/shopkeeper/reservations" className="hover:text-white transition-colors">Verify Reservations</Link></li>
            </ul>
          </div>

          {/* Demo & Architecture */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Tech & Deployment</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">React + TypeScript + Vite</span></li>
              <li><span className="text-slate-400">Node.js + Express + Mongoose</span></li>
              <li><span className="text-slate-400">MongoDB Atlas Database</span></li>
              <li><span className="text-slate-400">Deployment Target: Render</span></li>
              <li><Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">Admin Gateway</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NearStyle Marketplace. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            Simulated payment & demo credentials included for academic evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
};
