
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, FAQItem, Testimonial } from './types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './constants';

// --- SUPABASE CONFIGURATION ---
const SB_URL = (process.env as any).NEXT_PUBLIC_SUPABASE_URL || 'https://sagrvdjfqxfrrwruchcg.supabase.co';
const SB_KEY = (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

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
  const [products, setProductsState] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([DEFAULT_ADMIN]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 0, productViews: 0, addedToCart: 0, whatsappCheckouts: 0, abandonedCarts: 0, revenue: 0
  });

  // --- RESILIENT GLOBAL HYDRATION ---
  useEffect(() => {
    const hydrate = async () => {
      setIsInitialLoading(true);

      // Hydrate local data first
      const savedCart = safeLocalStorage.getItem('detalhes_cart');
      if (savedCart) { try { setCart(JSON.parse(savedCart)); } catch (e) {} }
      const savedAdmin = safeSessionStorage.getItem('detalhes_admin');
      if (savedAdmin) { try { setAdmin(JSON.parse(savedAdmin)); } catch (e) {} }

      let hasAnySuccess = false;

      // 1. Fetch General Settings
      try {
        const { data: settingsData, error } = await supabase.from('site_settings').select('data').eq('id', 1).maybeSingle();
        if (settingsData?.data) {
          setSettingsState(prev => ({ ...prev, ...settingsData.data }));
          hasAnySuccess = true;
        }
      } catch (e) { console.error("Settings Fetch Error", e); }

      // 2. Fetch Products
      try {
        const { data: productsData } = await supabase.from('products').select('*').order('createdAt', { ascending: false });
        if (productsData && productsData.length > 0) {
          setProductsState(productsData);
          hasAnySuccess = true;
        }
      } catch (e) { console.error("Products Fetch Error", e); }

      // 3. Fetch FAQ
      try {
        const { data: faqData } = await supabase.from('faq').select('*');
        if (faqData) {
          setSettingsState(prev => ({ ...prev, faqs: faqData }));
        }
      } catch (e) { console.error("FAQ Fetch Error", e); }

      // 4. Fetch Testimonials
      try {
        const { data: testimonialsData } = await supabase.from('testimonials').select('*');
        if (testimonialsData) {
          setSettingsState(prev => ({ ...prev, testimonials: testimonialsData }));
        }
      } catch (e) { console.error("Testimonials Fetch Error", e); }

      // 5. Fetch Analytics (Public data)
      try {
        const { data: analyticsData } = await supabase.from('analytics').select('*').eq('id', 1).maybeSingle();
        if (analyticsData) setAnalytics(analyticsData);
      } catch (e) { console.error("Analytics Fetch Error", e); }

      // 6. Fetch Admin Users (May fail for public users due to RLS)
      try {
        const { data: adminsData } = await supabase.from('admin_users').select('*');
        if (adminsData && adminsData.length > 0) setAdminUsers(adminsData);
      } catch (e) { /* Silent fail for public users */ }

      setDbStatus(hasAnySuccess ? 'connected' : 'error');
      
      // Secondary fallback to local storage if DB completely fails
      if (!hasAnySuccess) {
        const localSettings = safeLocalStorage.getItem('detalhes_settings');
        if (localSettings) {
          setSettingsState(prev => ({ ...prev, ...JSON.parse(localSettings) }));
        }
      }

      setIsInitialLoading(false);
    };

    hydrate();
  }, []);

  // --- PERSISTENCE HELPERS ---
  const syncSettings = useCallback(async (newSettings: StoreSettings) => {
    safeLocalStorage.setItem('detalhes_settings', JSON.stringify(newSettings));
    try {
      // Upsert main settings object
      await supabase.from('site_settings').upsert([{ id: 1, data: newSettings }]);
      
      // Sync sub-tables for individual record persistence
      if (newSettings.faqs?.length) {
        await supabase.from('faq').upsert(newSettings.faqs);
      }
      if (newSettings.testimonials?.length) {
        await supabase.from('testimonials').upsert(newSettings.testimonials);
      }
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
                    viewCount: (p.viewCount || 0) + (type === 'view' ? 1 : 0),
                    cartAddCount: (p.cartAddCount || 0) + (type === 'cart' ? 1 : 0)
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
