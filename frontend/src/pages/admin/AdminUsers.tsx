import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { IUser } from '../../types';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const query = filterRole !== 'ALL' ? `?role=${filterRole}` : '';
        const res = await api.get(`/admin/users${query}`);
        setUsers(res.data || []);
      } catch (err) {
        console.warn('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Console
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Platform Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Registered Users ({users.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of customers, shopkeepers, and administrators.
          </p>
        </div>

        <div className="flex gap-2">
          {['ALL', 'CUSTOMER', 'SHOPKEEPER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterRole === r
                  ? 'bg-navy-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading user directory...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u._id || u.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.email}</span>
                      {u.phone && <span>• {u.phone}</span>}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
                    u.role === 'ADMIN'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : u.role === 'SHOPKEEPER'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-brand-50 text-brand-700 border-brand-200'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
