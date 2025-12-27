
import React, { useState } from 'react';
// Use namespace import and any-casting to bypass 'no exported member' errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import { StoreProvider, useStore } from './store';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Catalog from './pages/Catalog';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminSettings from './pages/Admin/Settings';
import AdminLogin from './pages/Admin/Login';

// Layouts
import Layout from './components/Layout';
import { LayoutDashboard, Package, Settings as SettingsIcon, LogOut, ChevronLeft, ShieldCheck, Menu, X } from 'lucide-react';

const { 
  MemoryRouter: Router, 
  Routes, 
  Route, 
  useLocation, 
  Navigate, 
  useParams,
  Link 
} = ReactRouterDOM as any;

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin } = useStore();
  if (!admin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { logout } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Painel', path: '/admin', icon: LayoutDashboard },
    { label: 'Produtos', path: '/admin/products', icon: Package },
    { label: 'Configurações', path: '/admin/settings', icon: SettingsIcon },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-10 border-b border-gray-50 text-center">
        <h2 className="font-serif text-xl tracking-[0.2em] font-bold">DETALHES <span className="text-[#D5BDAF]">ADM</span></h2>
      </div>
      <nav className="flex-grow p-6 space-y-4 pt-12">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold transition-all rounded-full ${location.pathname === item.path ? 'bg-[#212529] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <item.icon size={16} strokeWidth={1.5} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-8 border-t border-gray-50 space-y-2">
        <Link to="/" className="flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 hover:text-black transition-all rounded-full hover:bg-gray-50">
          <ChevronLeft size={16} />
          <span>Loja</span>
        </Link>
        <button onClick={logout} className="w-full flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold text-red-400 hover:bg-red-50 transition-all rounded-full">
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FDFBF9]">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed inset-y-0 z-50 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-72 h-full bg-white animate-slide-right" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow lg:ml-64 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-40">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500 hover:text-black">
              <Menu size={24} />
           </button>
           <h2 className="font-serif font-bold tracking-widest text-sm">DETALHES ADM</h2>
           <div className="w-10"></div> {/* Spacer for alignment */}
        </header>

        <main className="p-4 md:p-8 lg:p-16 w-full max-w-full overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

const PolicyPage: React.FC = () => {
    const { type } = useParams();
    const { settings } = useStore();
    
    const titles: Record<string, string> = {
        'about': 'Sobre a Marca',
        'shipping': 'Política de Envio',
        'returns': 'Trocas e Devoluções',
        'warranty': 'Garantia Premium'
    };

    const content = (settings.institutional as any)[type || 'about'];
    const title = titles[type || 'about'] || 'Informações';

    return (
        <div className="max-w-3xl mx-auto px-6 py-24 animate-fade-in min-h-[60vh]">
            <h1 className="text-4xl md:text-5xl font-serif mb-12 border-b border-gray-100 pb-8">{title}</h1>
            <div className="prose prose-stone max-w-none">
                <p className="text-gray-600 leading-loose text-lg font-light whitespace-pre-line italic font-serif">
                   "{content}"
                </p>
            </div>
            <div className="mt-20 pt-10 border-t border-gray-50 flex items-center space-x-4 text-gray-400">
                <ShieldCheck size={20} />
                <span className="text-[10px] uppercase tracking-widest font-bold">Compromisso Detalhes Store</span>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
          <Route path="/gifts" element={<Layout><Catalog /></Layout>} />
          <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/policy/:type" element={<Layout><PolicyPage /></Layout>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard><AdminLayout><AdminDashboard /></AdminLayout></AdminGuard>} />
          <Route path="/admin/products" element={<AdminGuard><AdminLayout><AdminProducts /></AdminLayout></AdminGuard>} />
          <Route path="/admin/settings" element={<AdminGuard><AdminLayout><AdminSettings /></AdminLayout></AdminGuard>} />
        </Routes>
      </Router>
    </StoreProvider>
  );
};

export default App;
