"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, Tag } from '../types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from '../constants';

interface Notification {
  id: number;
  message: string;
}

interface StoreContextType {
  settings: StoreSettings;
  setSettings: (settings: StoreSettings) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  cart: CartItem[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  analytics: AnalyticsData;
  recordEvent: (type: 'view' | 'cart' | 'checkout', pId?: string) => void;
  admin: AdminUser | null;
  adminUsers: AdminUser[];
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  updateAdminUser: (id: string, username: string, newPassword?: string) => Promise<void>;
  createAdminUser: (username: string, passwordHash: string, role: 'superadmin' | 'editor') => void;
  deleteAdminUser: (id: string) => void;
  notifications: Notification[];
  showNotification: (message: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_ADMIN: AdminUser = {
  id: 'default-admin',
  username: 'admin',
  passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  role: 'superadmin',
  createdAt: 1700000000000
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettingsState] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [products, setProductsState] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([DEFAULT_ADMIN]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 842, productViews: 2450, addedToCart: 312, whatsappCheckouts: 94, abandonedCarts: 218, revenue: 18450
  });

  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem('detalhes_settings');
    const savedProducts = localStorage.getItem('detalhes_products');
    const savedCart = localStorage.getItem('detalhes_cart');
    const savedAdminUsers = localStorage.getItem('detalhes_admin_users');
    const savedAnalytics = localStorage.getItem('detalhes_analytics');
    const savedAdmin = sessionStorage.getItem('detalhes_admin');

    if (savedSettings) setSettingsState(JSON.parse(savedSettings));
    if (savedProducts) setProductsState(JSON.parse(savedProducts));
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedAdminUsers) setAdminUsers(JSON.parse(savedAdminUsers));
    if (savedAnalytics) setAnalytics(JSON.parse(savedAnalytics));
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('detalhes_settings', JSON.stringify(settings));
    localStorage.setItem('detalhes_products', JSON.stringify(products));
    localStorage.setItem('detalhes_cart', JSON.stringify(cart));
    localStorage.setItem('detalhes_admin_users', JSON.stringify(adminUsers));
    localStorage.setItem('detalhes_analytics', JSON.stringify(analytics));
  }, [settings, products, cart, adminUsers, analytics, mounted]);

  const showNotification = (message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const setSettings = (newSettings: StoreSettings) => setSettingsState(newSettings);
  const setProducts = (newProducts: Product[]) => setProductsState(newProducts);
  const addProduct = (p: Product) => setProductsState(prev => [...prev, p]);
  const updateProduct = (p: Product) => setProductsState(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProductsState(prev => prev.filter(item => item.id !== id));

  const login = async (u: string, p: string) => {
    const normalizedUser = u.trim().toLowerCase();
    const inputHash = await hashPassword(p.trim());
    const user = adminUsers.find(user => user.username.toLowerCase() === normalizedUser && user.passwordHash === inputHash);
    if (user) {
      setAdmin(user);
      sessionStorage.setItem('detalhes_admin', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem('detalhes_admin');
  };

  const updateAdminUser = async (id: string, username: string, newPassword?: string) => {
    const updatedUsers = await Promise.all(adminUsers.map(async u => {
      if (u.id === id) {
        const passwordHash = newPassword ? await hashPassword(newPassword.trim()) : u.passwordHash;
        return { ...u, username: username.trim().toLowerCase(), passwordHash };
      }
      return u;
    }));
    setAdminUsers(updatedUsers);
  };

  const createAdminUser = (username: string, passwordHash: string, role: 'superadmin' | 'editor') => {
    const newUser: AdminUser = { id: Math.random().toString(36).substr(2, 9), username: username.toLowerCase(), passwordHash, role, createdAt: Date.now() };
    setAdminUsers(prev => [...prev, newUser]);
  };

  const deleteAdminUser = (id: string) => {
    setAdminUsers(prev => prev.filter(u => u.id !== id));
  };

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { productId, quantity: 1 }];
    });
    recordEvent('cart', productId);
    if (product) showNotification(`${product.name} na sacola ✨`);
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };
  const clearCart = () => setCart([]);

  const recordEvent = (type: 'view' | 'cart' | 'checkout', pId?: string) => {
    setAnalytics(prev => ({
      ...prev,
      productViews: type === 'view' ? prev.productViews + 1 : prev.productViews,
      addedToCart: type === 'cart' ? prev.addedToCart + 1 : prev.addedToCart,
      whatsappCheckouts: type === 'checkout' ? prev.whatsappCheckouts + 1 : prev.whatsappCheckouts,
    }));
    if (pId) {
      setProductsState(prev => prev.map(p => p.id === pId ? {
        ...p, viewCount: type === 'view' ? p.viewCount + 1 : p.viewCount, cartAddCount: type === 'cart' ? p.cartAddCount + 1 : p.cartAddCount
      } : p));
    }
  };

  return (
    <StoreContext.Provider value={{
      settings, setSettings, products, setProducts, addProduct, updateProduct, deleteProduct,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      analytics, recordEvent, admin, adminUsers, login, logout, updateAdminUser,
      createAdminUser, deleteAdminUser, notifications, showNotification
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};