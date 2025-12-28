
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, Tag } from './types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './constants';

// --- PERSISTENCE CONFIGURATION ---
// These would typically come from environment variables.
// If not provided, the store will gracefully fallback to LocalStorage/Defaults.
const SB_URL = (process.env as any).SUPABASE_URL || '';
const SB_KEY = (process.env as any).SUPABASE_ANON_KEY || '';

const supabase = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

const safeLocalStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
};

const safeSessionStorage = {
  getItem: (key: string) => {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { sessionStorage.setItem(key, value); } catch (e) {}
  },
  removeItem: (key: string) => {
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
      
      // Load local cart/session
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
          // Fetch global state from Supabase
          // We use a single table 'store_configs' with JSONB columns for simplicity
          const { data, error } = await supabase
            .from('store_configs')
            .select('*')
            .single();

          if (!error && data) {
            if (data.settings) setSettingsState({ ...INITIAL_SETTINGS, ...data.settings });
            if (data.products) setProductsState(data.products);
            if (data.analytics) setAnalytics(data.analytics);
            if (data.admin_users) setAdminUsers(data.admin_users);
          } else if (error && error.code === 'PGRST116') {
            // Table is empty, initialize it
            await supabase.from('store_configs').insert([{
              id: 1,
              settings: INITIAL_SETTINGS,
              products: INITIAL_PRODUCTS,
              analytics: { visitors: 0, productViews: 0, addedToCart: 0, whatsappCheckouts: 0, abandonedCarts: 0, revenue: 0 },
              admin_users: [DEFAULT_ADMIN]
            }]);
          }
        } catch (e) {
          console.error("Failed to hydrate from global storage", e);
        }
      } else {
        // Fallback to LocalStorage for offline/local dev
        const savedSettings = safeLocalStorage.getItem('detalhes_settings');
        if (savedSettings) {
          try { setSettingsState({ ...INITIAL_SETTINGS, ...JSON.parse(savedSettings) }); } catch (e) {}
        }
        const savedProducts = safeLocalStorage.getItem('detalhes_products');
        if (savedProducts) {
          try { setProductsState(JSON.parse(savedProducts)); } catch (e) {}
        }
        const savedAnalytics = safeLocalStorage.getItem('detalhes_analytics');
        if (savedAnalytics) {
          try { setAnalytics(JSON.parse(savedAnalytics)); } catch (e) {}
        }
      }
      
      setIsInitialLoading(false);
    };

    hydrate();
  }, []);

  // --- PERSISTENCE HELPERS ---
  const syncGlobal = useCallback(async (key: string, value: any) => {
    safeLocalStorage.setItem(`detalhes_${key}`, JSON.stringify(value));
    if (supabase) {
      try {
        await supabase.from('store_configs').update({ [key]: value }).eq('id', 1);
      } catch (e) {
        console.warn("Global sync failed, will retry later", e);
      }
    }
  }, []);

  // Update effect for cart (always local)
  useEffect(() => {
    safeLocalStorage.setItem('detalhes_cart', JSON.stringify(cart));
  }, [cart]);

  // Record visitors globally (once per session)
  useEffect(() => {
    if (!isInitialLoading) {
      const visited = safeSessionStorage.getItem('detalhes_visited');
      if (!visited) {
        setAnalytics(prev => {
          const updated = { ...prev, visitors: prev.visitors + 1 };
          syncGlobal('analytics', updated);
          return updated;
        });
        safeSessionStorage.setItem('detalhes_visited', 'true');
      }
    }
  }, [isInitialLoading, syncGlobal]);

  const showNotification = (message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const setSettings = (newSettings: StoreSettings) => {
    setSettingsState(newSettings);
    syncGlobal('settings', newSettings);
  };

  const setProducts = (newProducts: Product[]) => {
    setProductsState(newProducts);
    syncGlobal('products', newProducts);
  };
  
  const addProduct = (p: Product) => {
    const next = [...products, p];
    setProductsState(next);
    syncGlobal('products', next);
  };

  const updateProduct = (p: Product) => {
    const next = products.map(item => item.id === p.id ? p : item);
    setProductsState(next);
    syncGlobal('products', next);
  };

  const deleteProduct = (id: string) => {
    const next = products.filter(item => item.id !== id);
    setProductsState(next);
    syncGlobal('products', next);
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
        return { ...u, username: username.trim().toLowerCase(), passwordHash };
      }
      return u;
    }));
    setAdminUsers(updatedUsers);
    syncGlobal('admin_users', updatedUsers);
    
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
    const next = [...adminUsers, newUser];
    setAdminUsers(next);
    syncGlobal('admin_users', next);
  };

  const deleteAdminUser = (id: string) => {
    if (id === 'default-admin' || (admin && admin.id === id)) {
        showNotification("Não é possível excluir o administrador principal ou sua própria conta.");
        return;
    }
    const next = adminUsers.filter(u => u.id !== id);
    setAdminUsers(next);
    syncGlobal('admin_users', next);
    showNotification("Administrador removido.");
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
      productViews: type === 'view' ? analytics.productViews + 1 : analytics.productViews,
      addedToCart: type === 'cart' ? analytics.addedToCart + 1 : analytics.addedToCart,
      whatsappCheckouts: type === 'checkout' ? analytics.whatsappCheckouts + 1 : analytics.whatsappCheckouts,
    };
    
    setAnalytics(updatedAnalytics);
    syncGlobal('analytics', updatedAnalytics);
    
    if (pId) {
        const nextProducts = products.map(p => {
            if (p.id === pId) {
                return {
                    ...p,
                    viewCount: type === 'view' ? p.viewCount + 1 : p.viewCount,
                    cartAddCount: type === 'cart' ? p.cartAddCount + 1 : p.cartAddCount
                };
            }
            return p;
        });
        setProductsState(nextProducts);
        syncGlobal('products', nextProducts);
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
