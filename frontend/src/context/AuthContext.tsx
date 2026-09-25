import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, IStore, UserRole } from '../types';
import api from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: IUser | null;
  store: IStore | null;
  token: string | null;
  loading: boolean;
  loginCustomer: (data: any) => Promise<void>;
  registerCustomer: (data: any) => Promise<void>;
  loginShopkeeper: (data: any) => Promise<void>;
  registerShopkeeper: (data: any) => Promise<void>;
  loginAdmin: (data: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: any) => Promise<void>;
  quickLoginDemo: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [store, setStore] = useState<IStore | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nearstyle_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const fetchCurrentUser = async () => {
    try {
      const storedToken = localStorage.getItem('nearstyle_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      setUser(res.data.user);
      if (res.data.store) {
        setStore(res.data.store);
      }
    } catch (err) {
      console.warn('Authentication expired or invalid');
      localStorage.removeItem('nearstyle_token');
      setToken(null);
      setUser(null);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginCustomer = async (data: any) => {
    try {
      const res = await api.post('/auth/customer/login', data);
      localStorage.setItem('nearstyle_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      success(`Welcome back, ${res.data.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed');
      throw err;
    }
  };

  const registerCustomer = async (data: any) => {
    try {
      const res = await api.post('/auth/customer/register', data);
      localStorage.setItem('nearstyle_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      success('Account created successfully!');
    } catch (err: any) {
      error(err.message || 'Registration failed');
      throw err;
    }
  };

  const loginShopkeeper = async (data: any) => {
    try {
      const res = await api.post('/auth/shopkeeper/login', data);
      localStorage.setItem('nearstyle_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.store) {
        setStore(res.data.store);
      }
      success(`Welcome back, ${res.data.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed');
      throw err;
    }
  };

  const registerShopkeeper = async (data: any) => {
    try {
      const res = await api.post('/auth/shopkeeper/register', data);
      localStorage.setItem('nearstyle_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.store) {
        setStore(res.data.store);
      }
      success('Store and shopkeeper account registered successfully!');
    } catch (err: any) {
      error(err.message || 'Registration failed');
      throw err;
    }
  };

  const loginAdmin = async (data: any) => {
    try {
      const res = await api.post('/auth/admin/login', data);
      localStorage.setItem('nearstyle_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      success('Admin logged in successfully!');
    } catch (err: any) {
      error(err.message || 'Admin login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('nearstyle_token');
    setToken(null);
    setUser(null);
    setStore(null);
    success('Logged out successfully.');
  };

  const updateUserProfile = async (data: any) => {
    try {
      const res = await api.put('/auth/profile', data);
      setUser(res.data.user);
      success('Profile updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Quick 1-click Demo Account Login Helper
  const quickLoginDemo = async (role: UserRole) => {
    try {
      if (role === 'CUSTOMER') {
        await loginCustomer({ email: 'demo.customer@nearstyle.com', password: 'Demo@123' });
      } else if (role === 'SHOPKEEPER') {
        await loginShopkeeper({ email: 'demo.shopkeeper@nearstyle.com', password: 'Demo@123' });
      } else if (role === 'ADMIN') {
        await loginAdmin({ email: 'demo.admin@nearstyle.com', password: 'Demo@123' });
      }
    } catch (err: any) {
      error(err.message || `Failed to sign in to demo ${role.toLowerCase()} account.`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        token,
        loading,
        loginCustomer,
        registerCustomer,
        loginShopkeeper,
        registerShopkeeper,
        loginAdmin,
        logout,
        updateUserProfile,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
