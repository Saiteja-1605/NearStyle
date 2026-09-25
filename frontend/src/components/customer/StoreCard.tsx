import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import { IStore } from '../../types';
import { Badge } from '../common/Badge';

interface StoreCardProps {
  store: IStore;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row">
      {/* Store Banner / Image */}
      <div className="relative h-44 sm:w-56 sm:h-auto bg-slate-100 shrink-0 overflow-hidden">
        <img
          src={store.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {store.allowsReservation && (
          <div className="absolute top-3 left-3">
            <span className="bg-brand-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <Clock className="w-3 h-3" /> Reserve & Try Active
            </span>
          </div>
        )}
      </div>

      {/* Store Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                {store.name}
              </h3>
              <p className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {store.area}, {store.city}
                </span>
                {store.distanceKm !== undefined && store.distanceKm !== null && (
                  <span className="text-brand-600 font-bold ml-1">
                    • {store.distanceKm} km away
                  </span>
                )}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{store.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {store.description || 'Quality fashion and verified styles in your local neighborhood.'}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {store.categories.map((cat, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Timings and CTA */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Open: {store.openingTime} - {store.closingTime}</span>
          </div>

          <Link
            to={`/stores/${store._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-all"
          >
            View Store & Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
