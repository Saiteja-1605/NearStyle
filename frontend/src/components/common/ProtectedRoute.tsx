import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!user) {
    // If accessing shopkeeper page, send to shopkeeper login
    if (allowedRoles?.includes('SHOPKEEPER')) {
      return <Navigate to="/shopkeeper/login" state={{ from: location }} replace />;
    }
    // If accessing admin page, send to admin login
    if (allowedRoles?.includes('ADMIN')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Default to customer login
    return <Navigate to="/customer/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role mismatch
    if (user.role === 'SHOPKEEPER') {
      return <Navigate to="/shopkeeper/dashboard" replace />;
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
