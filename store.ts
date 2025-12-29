
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, FAQItem, Testimonial } from './types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './constants';

// --- SUPABASE CONFIGURATION ---
const SB_URL = (process.env as any).NEXT_PUBLIC_SUPABASE_URL || 'https://sagrvdjfqxfrrwruchcg.supabase.co';
const SB_KEY = (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Placeholder

const supabase = createClient(SB_URL, SB_KEY);

const safeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, value); } catch (e) {}
  }
};

const safeSessionStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(key, value); } catch (e) {}
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.removeItem(key); } catch (e) {}
  }
};

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
  isInitialLoading: boolean;
  dbStatus: 'connected' | 'disconnected' | 'error';
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_ADMIN: AdminUser = {
  id: 'default-admin',
  username: 'admin',
  passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  role: 'superadmin',
  createdAt: 1700000000000
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [settings, setSettingsState] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [products, setProductsState] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([DEFAULT_ADMIN]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 0, productViews: 0, addedToCart: 0, whatsappCheckouts: 0, abandonedCarts: 0, revenue: 0
  });

  // --- GLOBAL HYDRATION ---
  useEffect(() => {
    const hydrate = async () => {
      setIsInitialLoading(true);

      const savedCart = safeLocalStorage.getItem('detalhes_cart');
      if (savedCart) { try { setCart(JSON.parse(savedCart)); } catch (e) {} }
      const savedAdmin = safeSessionStorage.getItem('detalhes_admin');
      if (savedAdmin) { try { setAdmin(JSON.parse(savedAdmin)); } catch (e) {} }

      try {
        const [
          settingsRes,
          productsRes,
          faqRes,
          testimonialsRes,
          adminsRes,
          analyticsRes
        ] = await Promise.all([
          supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
          supabase.from('products').select('*').order('createdAt', { ascending: false }),
          supabase.from('faq').select('*'),
          supabase.from('testimonials').select('*'),
          supabase.from('admin_users').select('*'),
          supabase.from('analytics').select('*').eq('id', 1).maybeSingle()
        ]);

        if (productsRes.data && productsRes.data.length > 0) {
          setProductsState(productsRes.data);
        } else {
          setProductsState(INITIAL_PRODUCTS);
        }

        if (adminsRes.data && adminsRes.data.length > 0) {
          setAdminUsers(adminsRes.data);
        }

        if (analyticsRes.data) {
          setAnalytics(analyticsRes.data);
        }

        let remoteSettings = settingsRes.data?.data || INITIAL_SETTINGS;
        
        // Merge with separate table data for robustness
        if (faqRes.data) remoteSettings.faqs = faqRes.data;
        if (testimonialsRes.data) remoteSettings.testimonials = testimonialsRes.data;
        
        setSettingsState({ ...INITIAL_SETTINGS, ...remoteSettings });
        setDbStatus('connected');

      } catch (e) {
        console.error("Supabase Hydration Error:", e);
        setDbStatus('error');
        const localSettings = safeLocalStorage.getItem('detalhes_settings');
        if (localSettings) setSettingsState({ ...INITIAL_SETTINGS, ...JSON.parse(localSettings) });
      } finally {
        setIsInitialLoading(false);
      }
    };

    hydrate();
  }, []);

  // --- PERSISTENCE HELPERS ---
  const syncSettings = useCallback(async (newSettings: StoreSettings) => {
    safeLocalStorage.setItem('detalhes_settings', JSON.stringify(newSettings));
    try {
      await supabase.from('site_settings').upsert([{ id: 1, data: newSettings }]);
      // Sync FAQ and Testimonials to specific tables too
      if (newSettings.faqs) await supabase.from('faq').upsert(newSettings.faqs);
      if (newSettings.testimonials) await supabase.from('testimonials').upsert(newSettings.testimonials);
    } catch (e) {
      console.warn("Global settings sync failed:", e);
    }
  }, []);

  const syncProduct = useCallback(async (p: Product, action: 'upsert' | 'delete') => {
    try {
      if (action === 'delete') {
        await supabase.from('products').delete().eq('id', p.id);
      } else {
        await supabase.from('products').upsert(p);
      }
    } catch (e) {
      console.warn("Product sync failed:", e);
    }
  }, []);

  const syncAdmin = useCallback(async (user: AdminUser, action: 'upsert' | 'delete') => {
    try {
      if (action === 'delete') {
        await supabase.from('admin_users').delete().eq('id', user.id);
      } else {
        await supabase.from('admin_users').upsert(user);
      }
    } catch (e) {
      console.warn("Admin sync failed:", e);
    }
  }, []);

  const syncAnalytics = useCallback(async (data: AnalyticsData) => {
    try {
      await supabase.from('analytics').upsert({ id: 1, ...data });
    } catch (e) {
      console.warn("Analytics sync failed:", e);
    }
  }, []);

  const showNotification = (message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const setSettings = (newSettings: StoreSettings) => {
    setSettingsState(newSettings);
    syncSettings(newSettings);
  };

  const setProducts = (newProducts: Product[]) => {
    setProductsState(newProducts);
    // Note: Global sync for whole array is expensive, better sync item by item
  };
  
  const addProduct = (p: Product) => {
    setProductsState(prev => [...prev, p]);
    syncProduct(p, 'upsert');
  };

  const updateProduct = (p: Product) => {
    setProductsState(prev => prev.map(item => item.id === p.id ? p : item));
    syncProduct(p, 'upsert');
  };

  const deleteProduct = (id: string) => {
    const p = products.find(i => i.id === id);
    if (p) {
      setProductsState(prev => prev.filter(item => item.id !== id));
      syncProduct(p, 'delete');
    }
  };

  const login = async (u: string, p: string) => {
    const normalizedUser = u.trim().toLowerCase();
    const normalizedPass = p.trim();
    const inputHash = await hashPassword(normalizedPass);
    const user = adminUsers.find(user => 
      user.username.trim().toLowerCase() === normalizedUser && 
      user.passwordHash === inputHash
    );
    if (user) {
      setAdmin(user);
      safeSessionStorage.setItem('detalhes_admin', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    safeSessionStorage.removeItem('detalhes_admin');
  };

  const updateAdminUser = async (id: string, username: string, newPassword?: string) => {
    const updatedUsers = await Promise.all(adminUsers.map(async u => {
      if (u.id === id) {
        const passwordHash = newPassword ? await hashPassword(newPassword.trim()) : u.passwordHash;
        const updated = { ...u, username: username.trim().toLowerCase(), passwordHash };
        syncAdmin(updated, 'upsert');
        return updated;
      }
      return u;
    }));
    setAdminUsers(updatedUsers);
    if (admin && admin.id === id) {
      const updatedAdmin = updatedUsers.find(u => u.id === id)!;
      setAdmin(updatedAdmin);
      safeSessionStorage.setItem('detalhes_admin', JSON.stringify(updatedAdmin));
    }
  };

  const createAdminUser = (username: string, passwordHash: string, role: 'superadmin' | 'editor') => {
    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      username: username.trim().toLowerCase(),
      passwordHash,
      role,
      createdAt: Date.now()
    };
    setAdminUsers(prev => [...prev, newUser]);
    syncAdmin(newUser, 'upsert');
  };

  const deleteAdminUser = (id: string) => {
    const user = adminUsers.find(u => u.id === id);
    if (id === 'default-admin' || (admin && admin.id === id)) {
        showNotification("Operação não permitida.");
        return;
    }
    if (user) {
      setAdminUsers(prev => prev.filter(u => u.id !== id));
      syncAdmin(user, 'delete');
      showNotification("Administrador removido.");
    }
  };

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      const newCart = existing 
        ? prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item)
        : [...prev, { productId, quantity: 1 }];
      safeLocalStorage.setItem('detalhes_cart', JSON.stringify(newCart));
      return newCart;
    });
    recordEvent('cart', productId);
    if (product) {
      showNotification(`${product.name} adicionado à sacola ✨`);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.productId !== productId);
      safeLocalStorage.setItem('detalhes_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => {
      const newCart = prev.map(item => item.productId === productId ? { ...item, quantity: qty } : item);
      safeLocalStorage.setItem('detalhes_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    safeLocalStorage.setItem('detalhes_cart', '[]');
  };

  const recordEvent = (type: 'view' | 'cart' | 'checkout', pId?: string) => {
    const updatedAnalytics = {
      ...analytics,
      productViews: type === 'view' ? analytics.productViews + 1 : analytics.productViews,
      addedToCart: type === 'cart' ? analytics.addedToCart + 1 : analytics.addedToCart,
      whatsappCheckouts: type === 'checkout' ? analytics.whatsappCheckouts + 1 : analytics.whatsappCheckouts,
    };
    setAnalytics(updatedAnalytics);
    syncAnalytics(updatedAnalytics);
    if (pId) {
        const nextProducts = products.map(p => {
            if (p.id === pId) {
                const updatedP = {
                    ...p,
                    viewCount: p.viewCount + (type === 'view' ? 1 : 0),
                    cartAddCount: p.cartAddCount + (type === 'cart' ? 1 : 0)
                };
                syncProduct(updatedP, 'upsert');
                return updatedP;
            }
            return p;
        });
        setProductsState(nextProducts);
    }
  };

  return React.createElement(
    StoreContext.Provider,
    {
      value: {
        settings, setSettings, products, setProducts, addProduct, updateProduct, deleteProduct,
        cart, addToCart, removeFromCart, updateCartQuantity, clearCart, 
        analytics, recordEvent, admin, adminUsers, login, logout, updateAdminUser, 
        createAdminUser, deleteAdminUser, notifications, showNotification, isInitialLoading, dbStatus
      },
    },
    children
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
