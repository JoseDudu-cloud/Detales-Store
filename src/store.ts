import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings, Product, AnalyticsData, CartItem, AdminUser, Tag } from './types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './constants';

const safeLocalStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Storage access denied', e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage access denied', e);
    }
  }
};

const safeSessionStorage = {
  getItem: (key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn('Storage access denied', e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage access denied', e);
    }
  },
  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage access denied', e);
    }
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
  const [settings, setSettingsState] = useState<StoreSettings>(() => {
    const saved = safeLocalStorage.getItem('detalhes_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = safeLocalStorage.getItem('detalhes_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeLocalStorage.getItem('detalhes_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = safeSessionStorage.getItem('detalhes_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = safeLocalStorage.getItem('detalhes_admin_users');
    let users: AdminUser[] = saved ? JSON.parse(saved) : [];
    
    const hasDefaultAdmin = users.find(u => u.id === 'default-admin');
    if (!hasDefaultAdmin) {
      users = [DEFAULT_ADMIN, ...users];
    } else if (hasDefaultAdmin.username !== DEFAULT_ADMIN.username || hasDefaultAdmin.passwordHash !== DEFAULT_ADMIN.passwordHash) {
      users = users.map(u => u.id === 'default-admin' ? DEFAULT_ADMIN : u);
    }
    
    return users;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    const saved = safeLocalStorage.getItem('detalhes_analytics');
    return saved ? JSON.parse(saved) : {
      visitors: 842,
      productViews: 2450,
      addedToCart: 312,
      whatsappCheckouts: 94,
      abandonedCarts: 218,
      revenue: 18450
    };
  });

  useEffect(() => {
    safeLocalStorage.setItem('detalhes_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    safeLocalStorage.setItem('detalhes_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    const updatedProducts = products.map(p => {
      const isNew = (Date.now() - p.createdAt) < (1000 * 60 * 60 * 24 * 7); 
      const isBestseller = p.cartAddCount > 50 || p.viewCount > 500;
      
      const newTags = [...p.tags.filter(t => t !== Tag.NEW && t !== Tag.BESTSELLER)];
      if (isNew) newTags.push(Tag.NEW);
      if (isBestseller) newTags.push(Tag.BESTSELLER);
      
      return { ...p, tags: Array.from(new Set(newTags)) };
    });
    
    if (JSON.stringify(updatedProducts) !== JSON.stringify(products)) {
        setProductsState(updatedProducts);
    }
    
    safeLocalStorage.setItem('detalhes_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeLocalStorage.setItem('detalhes_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeLocalStorage.setItem('detalhes_analytics', JSON.stringify(analytics));
  }, [analytics]);

  const showNotification = (message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const setSettings = (newSettings: StoreSettings) => setSettingsState(newSettings);
  const setProducts = (newProducts: Product[]) => setProductsState(newProducts);
  
  const addProduct = (p: Product) => setProductsState(prev => [...prev, p]);
  const updateProduct = (p: Product) => setProductsState(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProductsState(prev => prev.filter(item => item.id !== id));

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
  };

  const deleteAdminUser = (id: string) => {
    if (id === 'default-admin' || (admin && admin.id === id)) {
        showNotification("Não é possível excluir o administrador principal ou sua própria conta.");
        return;
    }
    setAdminUsers(prev => prev.filter(u => u.id !== id));
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
    setAnalytics(prev => ({
      ...prev,
      productViews: type === 'view' ? prev.productViews + 1 : prev.productViews,
      addedToCart: type === 'cart' ? prev.addedToCart + 1 : prev.addedToCart,
      whatsappCheckouts: type === 'checkout' ? prev.whatsappCheckouts + 1 : prev.whatsappCheckouts,
    }));
    
    if (pId) {
        setProductsState(prev => prev.map(p => {
            if (p.id === pId) {
                return {
                    ...p,
                    viewCount: type === 'view' ? p.viewCount + 1 : p.viewCount,
                    cartAddCount: type === 'cart' ? p.cartAddCount + 1 : p.cartAddCount
                };
            }
            return p;
        }));
    }
  };

  return React.createElement(
    StoreContext.Provider,
    {
      value: {
        settings, setSettings, products, setProducts, addProduct, updateProduct, deleteProduct,
        cart, addToCart, removeFromCart, updateCartQuantity, clearCart, 
        analytics, recordEvent, admin, adminUsers, login, logout, updateAdminUser, 
        createAdminUser, deleteAdminUser, notifications, showNotification
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