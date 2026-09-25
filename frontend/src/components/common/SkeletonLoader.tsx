import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse">
      <div className="aspect-3/4 w-full bg-slate-200" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-1/3 bg-slate-200 rounded" />
        <div className="h-4 w-4/5 bg-slate-200 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-20 bg-slate-200 rounded" />
          <div className="h-4 w-12 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export const StoreCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse flex flex-col sm:flex-row">
      <div className="h-44 sm:w-48 sm:h-auto bg-slate-200 shrink-0" />
      <div className="p-5 flex-1 space-y-3">
        <div className="h-5 w-2/5 bg-slate-200 rounded" />
        <div className="h-3 w-4/5 bg-slate-200 rounded" />
        <div className="h-3 w-1/2 bg-slate-200 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-slate-200 rounded-full" />
          <div className="h-6 w-16 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse p-4 space-y-4">
      <div className="h-8 w-full bg-slate-100 rounded" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-10 w-full bg-slate-50 rounded" />
      ))}
    </div>
  );
};
