
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, Tag } from '../types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from '../constants';

// Notification interface for the toast notification system
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
  clearCart: () => void;
  analytics: AnalyticsData;
  admin: AdminUser | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  showNotification: (msg: string) => void;
  // Fix for property 'notifications' does not exist error
  notifications: Notification[];
  // Fix for property 'recordEvent' does not exist error
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
    visitors: 1240, 
    productViews: 4500, 
    addedToCart: 580, 
    whatsappCheckouts: 120, 
    abandonedCarts: 460, 
    revenue: 24500
  });

  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem('detalhes_cart');
    const savedAdmin = sessionStorage.getItem('detalhes_admin');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('detalhes_cart', JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId, quantity: 1 }];
    });
    // Track cart addition event
    recordEvent('cart', productId);
  };

  const removeFromCart = (pId: string) => setCart(prev => prev.filter(i => i.productId !== pId));
  const updateCartQuantity = (pId: string, q: number) => setCart(prev => prev.map(i => i.productId === pId ? { ...i, quantity: q } : i));
  const clearCart = () => setCart([]);

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
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const recordEvent = (type: 'view' | 'cart' | 'checkout', pId?: string) => {
    // Simple event logging for analytics tracking
    console.debug(`Event recorded: ${type}`, pId);
  };

  return (
    <StoreContext.Provider value={{
      settings, setSettings, products, setProducts, cart, addToCart,
      removeFromCart, updateCartQuantity, clearCart, analytics,
      admin, login, logout, showNotification, notifications, recordEvent
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
