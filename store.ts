
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, FAQItem, Testimonial } from './types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './constants';

// --- SUPABASE CONFIGURATION ---
// Credentials must be provided via environment variables in Vercel/Local env.
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
    hotbarMessages: loaded?.hotbarMessages || INITIAL_SETTINGS.hotbarMessages,
    trustIcons: loaded?.trustIcons || INITIAL_SETTINGS.trustIcons,
    categories: loaded?.categories || INITIAL_SETTINGS.categories,
    tags: loaded?.tags || INITIAL_SETTINGS.tags
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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
      
      // Load local cart/session (Browser state)
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
          // Parallel fetch from specific tables for source of truth
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
            supabase.from('site_settings').select('data').eq('id', 1).single(),
            supabase.from('products').select('*'),
            supabase.from('faq').select('*'),
            supabase.from('testimonials').select('*'),
            supabase.from('admin_users').select('*'),
            supabase.from('analytics').select('*').eq('id', 1).maybeSingle(),
            supabase.from('categories').select('name'),
            supabase.from('collections').select('name')
          ]);

          // Handle Products
          if (productsRes.data) {
            setProductsState(productsRes.data.length > 0 ? productsRes.data : []);
          }

          // Handle Admins
          if (adminsRes.data && adminsRes.data.length > 0) {
            setAdminUsers(adminsRes.data);
          }

          // Handle Analytics
          if (analyticsRes.data) {
            setAnalytics(analyticsRes.data);
          }

          // Compile Global Settings
          let baseSettings = settingsRes.data?.data ? mergeWithDefaults(settingsRes.data.data) : INITIAL_SETTINGS;
          
          // Override specific fields with table data if available
          if (faqRes.data) baseSettings.faqs = faqRes.data;
          if (testimonialsRes.data) baseSettings.testimonials = testimonialsRes.data;
          if (categoriesRes.data && categoriesRes.data.length > 0) {
            baseSettings.categories = categoriesRes.data.map((c: any) => c.name);
          }
          if (collectionsRes.data && collectionsRes.data.length > 0) {
            baseSettings.tags = collectionsRes.data.map((c: any) => c.name);
          }

          setSettingsState(baseSettings);

          // Seed missing default settings if DB is empty
          if (!settingsRes.data) {
             await supabase.from('site_settings').upsert([{ id: 1, data: INITIAL_SETTINGS }]);
          }

        } catch (e) {
          console.error("Global storage hydration failed", e);
        }
      } else {
        // Fallback to LocalStorage for dev without Supabase
        const savedSettings = safeLocalStorage.getItem('detalhes_settings');
        if (savedSettings) {
          try { setSettingsState(mergeWithDefaults(JSON.parse(savedSettings))); } catch (e) {}
        }
        const savedProducts = safeLocalStorage.getItem('detalhes_products');
        if (savedProducts) {
          try { setProductsState(JSON.parse(savedProducts)); } catch (e) {}
        }
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
        // Update main JSONB settings
        await supabase.from('site_settings').update({ data: newSettings }).eq('id', 1);
        
        // Sync individual tables to keep them as pure source of truth
        if (newSettings.faqs) {
          await supabase.from('faq').upsert(newSettings.faqs);
        }
        if (newSettings.testimonials) {
          await supabase.from('testimonials').upsert(newSettings.testimonials);
        }
        
        // Sync Categories
        if (newSettings.categories) {
            // Complex sync: delete missing, upsert current
            const catPayload = newSettings.categories.map(name => ({ name }));
            await supabase.from('categories').upsert(catPayload, { onConflict: 'name' });
        }
        
        // Sync Collections (Tags)
        if (newSettings.tags) {
            const colPayload = newSettings.tags.map(name => ({ name }));
            await supabase.from('collections').upsert(colPayload, { onConflict: 'name' });
        }
      } catch (e) {
        console.warn("Settings sync failed", e);
      }
    }
  }, []);

  const syncProduct = useCallback(async (p: Product, action: 'upsert' | 'delete') => {
    if (supabase) {
      try {
        if (action === 'delete') {
          await supabase.from('products').delete().eq('id', p.id);
        } else {
          await supabase.from('products').upsert(p);
        }
      } catch (e) {
        console.warn("Product sync failed", e);
      }
    }
  }, []);

  const syncAdmin = useCallback(async (user: AdminUser, action: 'upsert' | 'delete') => {
    if (supabase) {
      try {
        if (action === 'delete') {
          await supabase.from('admin_users').delete().eq('id', user.id);
        } else {
          await supabase.from('admin_users').upsert(user);
        }
      } catch (e) {
        console.warn("Admin sync failed", e);
      }
    }
  }, []);

  const syncAnalytics = useCallback(async (data: AnalyticsData) => {
    if (supabase) {
      try {
        await supabase.from('analytics').upsert({ id: 1, ...data });
      } catch (e) {
        console.warn("Analytics sync failed", e);
      }
    }
  }, []);

  useEffect(() => {
    safeLocalStorage.setItem('detalhes_cart', JSON.stringify(cart));
  }, [cart]);

  // Global visitor tracker
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
    // Note: Global sync for the entire array isn't recommended for performance; 
    // but individual methods handle p-by-p sync.
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
    
    // First check in-memory list
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
        createAdminUser, deleteAdminUser, notifications, showNotification, isInitialLoading
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
