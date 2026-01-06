
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, FAQItem, Testimonial } from './types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './constants';

// --- SUPABASE CONFIGURATION ---
const SB_URL = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || '';
const SB_KEY = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || '';

const supabase = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

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

export type SyncStatus = 'synced' | 'error' | 'checking';

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
  syncStatus: SyncStatus;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_ADMIN: AdminUser = {
  id: 'default-admin',
  username: 'admin',
  passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  role: 'superadmin',
  createdAt: 1700000000000
};

/**
 * Deep merge loaded settings with INITIAL_SETTINGS to prevent crashes
 */
const mergeWithDefaults = (loaded: any): StoreSettings => {
  return {
    ...INITIAL_SETTINGS,
    ...loaded,
    instagramSection: {
      ...INITIAL_SETTINGS.instagramSection,
      ...(loaded?.instagramSection || {})
    },
    socialLinks: {
      ...INITIAL_SETTINGS.socialLinks,
      ...(loaded?.socialLinks || {})
    },
    institutional: {
      ...INITIAL_SETTINGS.institutional,
      ...(loaded?.institutional || {})
    },
    hotbarMessages: Array.isArray(loaded?.hotbarMessages) ? loaded.hotbarMessages : INITIAL_SETTINGS.hotbarMessages,
    trustIcons: Array.isArray(loaded?.trustIcons) ? loaded.trustIcons : INITIAL_SETTINGS.trustIcons,
    categories: Array.isArray(loaded?.categories) ? loaded.categories : INITIAL_SETTINGS.categories,
    tags: Array.isArray(loaded?.tags) ? loaded.tags : INITIAL_SETTINGS.tags,
    testimonials: Array.isArray(loaded?.testimonials) ? loaded.testimonials : INITIAL_SETTINGS.testimonials,
    faqs: Array.isArray(loaded?.faqs) ? loaded.faqs : INITIAL_SETTINGS.faqs
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [settings, setSettingsState] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [products, setProductsState] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([DEFAULT_ADMIN]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 0, productViews: 0, addedToCart: 0, whatsappCheckouts: 0, abandonedCarts: 0, revenue: 0
  });

  // --- GLOBAL DATA HYDRATION ---
  useEffect(() => {
    const hydrate = async () => {
      setIsInitialLoading(true);
      setSyncStatus('checking');
      
      const savedCart = safeLocalStorage.getItem('detalhes_cart');
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) {}
      }
      const savedAdmin = safeSessionStorage.getItem('detalhes_admin');
      if (savedAdmin) {
        try { setAdmin(JSON.parse(savedAdmin)); } catch (e) {}
      }

      if (supabase) {
        try {
          const [
            settingsRes,
            productsRes,
            faqRes,
            testimonialsRes,
            adminsRes,
            analyticsRes,
            categoriesRes,
            collectionsRes
          ] = await Promise.all([
            supabase.from('site_settings').select('data').eq('id', 1).maybeSingle(),
            supabase.from('products').select('*').order('createdAt', { ascending: false }),
            supabase.from('faq').select('*'),
            supabase.from('testimonials').select('*'),
            supabase.from('admin_users').select('*'),
            supabase.from('analytics').select('*').eq('id', 1).maybeSingle(),
            supabase.from('categories').select('name'),
            supabase.from('collections').select('name')
          ]);

          if (settingsRes.error || productsRes.error) throw new Error('Sync failed');

          if (productsRes.data && productsRes.data.length > 0) {
            setProductsState(productsRes.data);
          }

          if (adminsRes.data && adminsRes.data.length > 0) {
            setAdminUsers(adminsRes.data);
          }

          if (analyticsRes.data) {
            setAnalytics(analyticsRes.data);
          }

          let baseSettings = settingsRes.data?.data ? mergeWithDefaults(settingsRes.data.data) : INITIAL_SETTINGS;
          
          if (faqRes.data && faqRes.data.length > 0) baseSettings.faqs = faqRes.data;
          if (testimonialsRes.data && testimonialsRes.data.length > 0) baseSettings.testimonials = testimonialsRes.data;
          if (categoriesRes.data && categoriesRes.data.length > 0) {
            baseSettings.categories = categoriesRes.data.map((c: any) => c.name);
          }
          if (collectionsRes.data && collectionsRes.data.length > 0) {
            baseSettings.tags = collectionsRes.data.map((c: any) => c.name);
          }

          setSettingsState(baseSettings);

          if (!settingsRes.data) {
             await supabase.from('site_settings').upsert([{ id: 1, data: INITIAL_SETTINGS }]);
          }
          setSyncStatus('synced');

        } catch (e) {
          console.error("Global storage hydration failed", e);
          setSyncStatus('error');
        }
      } else {
        const savedSettings = safeLocalStorage.getItem('detalhes_settings');
        if (savedSettings) {
          try { setSettingsState(mergeWithDefaults(JSON.parse(savedSettings))); } catch (e) {}
        }
        const savedProducts = safeLocalStorage.getItem('detalhes_products');
        if (savedProducts) {
          try { setProductsState(JSON.parse(savedProducts)); } catch (e) {}
        }
        setSyncStatus('error'); // No supabase config
      }
      
      setIsInitialLoading(false);
    };

    hydrate();
  }, []);

  // --- PERSISTENCE HELPERS ---
  const syncSettings = useCallback(async (newSettings: StoreSettings) => {
    safeLocalStorage.setItem('detalhes_settings', JSON.stringify(newSettings));
    if (supabase) {
      try {
        const { error } = await supabase.from('site_settings').upsert({ id: 1, data: newSettings });
        if (error) throw error;
        
        if (newSettings.faqs) {
          await supabase.from('faq').upsert(newSettings.faqs);
        }
        if (newSettings.testimonials) {
          await supabase.from('testimonials').upsert(newSettings.testimonials);
        }
        
        if (newSettings.categories) {
            const catPayload = newSettings.categories.map(name => ({ name }));
            await supabase.from('categories').upsert(catPayload, { onConflict: 'name' });
        }
        
        if (newSettings.tags) {
            const colPayload = newSettings.tags.map(name => ({ name }));
            await supabase.from('collections').upsert(colPayload, { onConflict: 'name' });
        }
        setSyncStatus('synced');
      } catch (e) {
        console.warn("Settings sync failed", e);
        setSyncStatus('error');
      }
    }
  }, []);

  const syncProduct = useCallback(async (p: Product, action: 'upsert' | 'delete') => {
    if (supabase) {
      try {
        if (action === 'delete') {
          const { error } = await supabase.from('products').delete().eq('id', p.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').upsert(p);
          if (error) throw error;
        }
        setSyncStatus('synced');
      } catch (e) {
        console.warn("Product sync failed", e);
        setSyncStatus('error');
      }
    }
  }, []);

  const syncAdmin = useCallback(async (user: AdminUser, action: 'upsert' | 'delete') => {
    if (supabase) {
      try {
        if (action === 'delete') {
          const { error } = await supabase.from('admin_users').delete().eq('id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('admin_users').upsert(user);
          if (error) throw error;
        }
        setSyncStatus('synced');
      } catch (e) {
        console.warn("Admin sync failed", e);
        setSyncStatus('error');
      }
    }
  }, []);

  const syncAnalytics = useCallback(async (data: AnalyticsData) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('analytics').upsert({ id: 1, ...data });
        if (error) throw error;
        setSyncStatus('synced');
      } catch (e) {
        console.warn("Analytics sync failed", e);
        setSyncStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    safeLocalStorage.setItem('detalhes_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!isInitialLoading) {
      const visited = safeSessionStorage.getItem('detalhes_visited');
      if (!visited) {
        setAnalytics(prev => {
          const updated = { ...prev, visitors: (prev.visitors || 0) + 1 };
          syncAnalytics(updated);
          return updated;
        });
        safeSessionStorage.setItem('detalhes_visited', 'true');
      }
    }
  }, [isInitialLoading, syncAnalytics]);

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
    setProductsState(prev => [p, ...prev]);
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
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
    recordEvent('cart', productId);
    if (product) {
      showNotification(`${product.name} adicionado à sacola ✨`);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => setCart([]);

  const recordEvent = (type: 'view' | 'cart' | 'checkout', pId?: string) => {
    const updatedAnalytics = {
      ...analytics,
      productViews: type === 'view' ? (analytics.productViews || 0) + 1 : analytics.productViews,
      addedToCart: type === 'cart' ? (analytics.addedToCart || 0) + 1 : analytics.addedToCart,
      whatsappCheckouts: type === 'checkout' ? (analytics.whatsappCheckouts || 0) + 1 : analytics.whatsappCheckouts,
    };
    
    setAnalytics(updatedAnalytics);
    syncAnalytics(updatedAnalytics);
    
    if (pId) {
        const nextProducts = products.map(p => {
            if (p.id === pId) {
                const updatedP = {
                    ...p,
                    viewCount: type === 'view' ? (p.viewCount || 0) + 1 : p.viewCount,
                    cartAddCount: type === 'cart' ? (p.cartAddCount || 0) + 1 : p.cartAddCount
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
        createAdminUser, deleteAdminUser, notifications, showNotification, isInitialLoading,
        syncStatus
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
