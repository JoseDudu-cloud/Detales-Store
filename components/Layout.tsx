
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Instagram, Phone, User, CheckCircle2, Facebook, MessageCircle } from 'lucide-react';
import { useStore } from '../store';
import Hotbar from './Hotbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, cart, notifications } = useStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Monitora o scroll para mudar o estilo do header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const TiktokIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
    </svg>
  );

  // Define se o header deve ser transparente baseado na rota e no scroll
  // No topo da Home, ele é transparente. Em outras páginas ou ao rolar, ele ganha fundo.
  const isHomePage = location.pathname === '/';
  const headerBgClass = (isHomePage && !isScrolled) 
    ? 'bg-transparent border-transparent' 
    : 'bg-white/80 backdrop-blur-lg border-gray-100 shadow-sm';
  
  const textColorClass = (isHomePage && !isScrolled)
    ? 'text-white'
    : 'text-gray-800';

  const navLinkClass = (isHomePage && !isScrolled)
    ? 'text-white/80 hover:text-white'
    : 'text-gray-500 hover:text-black';

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#D5BDAF] selection:text-white relative">
      <Hotbar />
      
      <header className={`py-4 px-6 md:px-12 sticky top-[32px] z-40 transition-all duration-500 ease-in-out border-b ${headerBgClass}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
          
          {/* Column 1: Mobile Menu & Logo */}
          <div className="flex items-center">
            <button onClick={() => setIsMenuOpen(true)} className={`md:hidden p-2 -ml-2 mr-2 transition-colors ${textColorClass}`}>
              <Menu size={22} />
            </button>
            <Link to="/" className="flex items-center">
              {settings.logoType === 'text' ? (
                <h1 className={`text-lg md:text-2xl font-serif tracking-[0.2em] font-bold transition-colors duration-500 ${textColorClass}`}>
                  {settings.logoText}
                </h1>
              ) : (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.logoText} 
                  className={`h-8 md:h-10 object-contain transition-all duration-500 ${(isHomePage && !isScrolled) ? 'brightness-0 invert' : ''}`} 
                />
              )}
            </Link>
          </div>

          {/* Column 2: Centered Navigation (Desktop Only) */}
          <nav className={`hidden md:flex items-center justify-center space-x-10 text-[11px] uppercase tracking-[0.25em] font-medium transition-colors duration-500 ${navLinkClass}`}>
            <Link to="/" className="transition">Início</Link>
            <Link to="/catalog" className="transition">Coleções</Link>
            <Link to="/catalog?cat=Kits & Presentes" className="transition">Presentes</Link>
          </nav>

          {/* Column 3: Icons */}
          <div className="flex items-center justify-end space-x-4 md:space-x-8">
            <Link to="/admin" className={`transition-colors duration-500 p-1 ${navLinkClass}`} title="Acesso Admin">
              <User size={18} strokeWidth={1.5} />
            </Link>

            <Link to="/cart" className="relative p-1">
              <ShoppingBag size={20} className={`transition-colors duration-500 ${textColorClass}`} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold transition-colors ${isScrolled || !isHomePage ? 'bg-[#212529]' : 'bg-[#D5BDAF]'}`}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-10 text-lg font-serif uppercase tracking-[0.2em] animate-fade-in">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-2">
            <X size={28} />
          </button>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Início</Link>
          <Link to="/catalog" onClick={() => setIsMenuOpen(false)}>Coleções</Link>
          <Link to="/catalog?cat=Kits & Presentes" onClick={() => setIsMenuOpen(false)}>Presentes</Link>
          <Link to="/cart" onClick={() => setIsMenuOpen(false)}>Minha Sacola</Link>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end space-y-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="bg-[#212529] text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4 animate-slide-up pointer-events-auto">
            <CheckCircle2 size={18} className="text-[#D5BDAF]" />
            <span className="text-xs uppercase tracking-widest font-bold">{n.message}</span>
          </div>
        ))}
      </div>

      {/* Floating WhatsApp Trigger */}
      {settings.whatsappNumber && (
        <a 
          href={`https://wa.me/${settings.whatsappNumber}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 group"
          aria-label="Fale conosco no WhatsApp"
        >
          <div className="relative">
            <MessageCircle size={32} fill="white" className="text-white" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse border-2 border-white">1</span>
          </div>
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white text-[#212529] px-4 py-2 rounded-2xl shadow-xl text-[10px] uppercase tracking-widest font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-100">
            Dúvidas? Fale conosco! ✨
          </div>
        </a>
      )}

      {/* Ajuste de margem negativa apenas na Home para o conteúdo subir sob o header transparente */}
      <main className={`flex-grow ${isHomePage ? '-mt-[73px]' : ''}`}>
        {children}
      </main>

      <footer className="bg-[#FAF7F2] py-20 px-6 md:px-12 text-[#212529]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-8">
              {settings.logoType === 'text' ? (
                <h2 className="font-serif text-2xl tracking-widest uppercase">{settings.logoText}</h2>
              ) : (
                <img src={settings.logoUrl} alt={settings.logoText} className="h-10 object-contain opacity-80" />
              )}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 font-light">
              {settings.footerContent}
            </p>
            <div className="flex space-x-6">
              {settings.socialLinks.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition"><Instagram size={18} strokeWidth={1.5} /></a>
              )}
              {settings.socialLinks.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition"><Facebook size={18} strokeWidth={1.5} /></a>
              )}
              {settings.socialLinks.tiktok && (
                <a href={settings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition"><TiktokIcon /></a>
              )}
              {settings.whatsappNumber && (
                <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition"><Phone size={18} strokeWidth={1.5} /></a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-gray-400">Explore</h3>
            <ul className="space-y-4 text-[11px] text-gray-600 uppercase tracking-widest">
              <li><Link to="/catalog" className="hover:text-black transition">Ver Catálogo</Link></li>
              <li><Link to="/catalog?cat=Kits & Presentes" className="hover:text-black transition">Presentes</Link></li>
              {settings.categories.slice(0, 3).map(cat => (
                 <li key={cat}><Link to={`/catalog?cat=${cat}`} className="hover:text-black transition">{cat}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-gray-400">Institucional</h3>
            <ul className="space-y-4 text-[11px] text-gray-600 uppercase tracking-widest">
              <li><Link to="/policy/returns" className="hover:text-black transition">Trocas e Devoluções</Link></li>
              <li><Link to="/policy/shipping" className="hover:text-black transition">Políticas de Envio</Link></li>
              <li><Link to="/policy/warranty" className="hover:text-black transition">Garantia</Link></li>
              <li><Link to="/policy/about" className="hover:text-black transition">Sobre a Marca</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-gray-400">Atendimento</h3>
            {settings.whatsappNumber && (
                <p className="text-sm text-gray-600 mb-2 font-light">WhatsApp: {settings.whatsappNumber}</p>
            )}
            <p className="text-sm text-gray-600 font-light">Email: {settings.contactEmail}</p>
            <div className="mt-8">
                <a 
                    href={`https://wa.me/${settings.whatsappNumber}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-600 transition shadow-lg"
                >
                    <MessageCircle size={14} />
                    <span>Falar Agora</span>
                </a>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-8 border-t border-gray-100 text-center text-[10px] text-gray-400 uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} {settings.logoText}. Design Minimalista & Essencial.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
