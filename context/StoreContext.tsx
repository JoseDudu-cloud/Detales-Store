
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser } from '../types';
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
  cart: CartItem[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  analytics: AnalyticsData;
  admin: AdminUser | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  notifications: Notification[];
  showNotification: (msg: string) => void;
  recordEvent: (type: 'view' | 'cart' | 'checkout', pId?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics] = useState<AnalyticsData>({
    visitors: 1240, productViews: 4500, addedToCart: 580, whatsappCheckouts: 120, abandonedCarts: 460, revenue: 24500
  });

  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem('detalhes_settings');
    const savedProducts = localStorage.getItem('detalhes_products');
    const savedCart = localStorage.getItem('detalhes_cart');
    const savedAdmin = sessionStorage.getItem('detalhes_admin');
    
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('detalhes_settings', JSON.stringify(settings));
      localStorage.setItem('detalhes_products', JSON.stringify(products));
      localStorage.setItem('detalhes_cart', JSON.stringify(cart));
    }
  }, [settings, products, cart, mounted]);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId, quantity: 1 }];
    });
    if (product) showNotification(`${product.name} na sacola ✨`);
  };

  const removeFromCart = (pId: string) => setCart(prev => prev.filter(i => i.productId !== pId));
  const updateCartQuantity = (pId: string, q: number) => setCart(prev => prev.map(i => i.productId === pId ? { ...i, quantity: Math.max(0, q) } : i));

  const login = async (u: string, p: string) => {
    if (u === 'admin' && p === 'admin') {
      const user: AdminUser = { id: '1', username: 'admin', role: 'superadmin', createdAt: Date.now(), passwordHash: '' };
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

  const showNotification = (message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const recordEvent = (type: string, pId?: string) => {
    console.log('Event recorded:', type, pId);
  };

  return (
    <StoreContext.Provider value={{
      settings, setSettings, products, setProducts, cart, addToCart,
      removeFromCart, updateCartQuantity, analytics, admin, login, logout,
      notifications, showNotification, recordEvent
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
