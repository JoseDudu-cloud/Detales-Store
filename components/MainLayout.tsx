"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Instagram, Phone, User, CheckCircle2, Facebook, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Hotbar from './Hotbar';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, cart, notifications } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = pathname === '/';
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage && pathname !== '/admin/login') {
     // O painel admin tem seu próprio layout no arquivo de página específico, 
     // mas aqui podemos decidir se mostramos o header comum ou não.
     // Para esta migração, manteremos o Layout comum apenas para a loja.
  }

  const headerBgClass = (isHomePage && !isScrolled) 
    ? 'bg-transparent border-transparent' 
    : 'bg-white/80 backdrop-blur-lg border-gray-100 shadow-sm';
  
  const textColorClass = (isHomePage && !isScrolled) ? 'text-white' : 'text-gray-800';
  const navLinkClass = (isHomePage && !isScrolled) ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-black';

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#D5BDAF] selection:text-white relative">
      {!isAdminPage && <Hotbar />}
      
      {!isAdminPage && (
        <header className={`py-4 px-6 md:px-12 sticky top-0 z-40 transition-all duration-500 ease-in-out border-b ${headerBgClass}`}>
          <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
            
            <div className="flex items-center">
              <button onClick={() => setIsMenuOpen(true)} className={`md:hidden p-2 -ml-2 mr-2 transition-colors ${textColorClass}`}>
                <Menu size={22} />
              </button>
              <Link href="/" className="flex items-center">
                {settings.logoType === 'text' ? (
                  <h1 className={`text-lg md:text-2xl font-serif tracking-[0.2em] font-bold transition-colors duration-500 ${textColorClass}`}>
                    {settings.logoText}
                  </h1>
                ) : (
                  <img src={settings.logoUrl} alt={settings.logoText} className={`h-8 md:h-10 object-contain transition-all duration-500 ${(isHomePage && !isScrolled) ? 'brightness-0 invert' : ''}`} />
                )}
              </Link>
            </div>

            <nav className={`hidden md:flex items-center justify-center space-x-10 text-[11px] uppercase tracking-[0.25em] font-medium transition-colors duration-500 ${navLinkClass}`}>
              <Link href="/">Início</Link>
              <Link href="/catalog">Coleções</Link>
              <Link href="/gifts">Presentes</Link>
            </nav>

            <div className="flex items-center justify-end space-x-4 md:space-x-8">
              <Link href="/admin" className={`transition-colors duration-500 p-1 ${navLinkClass}`} title="Acesso Admin">
                <User size={18} strokeWidth={1.5} />
              </Link>

              <Link href="/cart" className="relative p-1">
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
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center space-y-10 text-lg font-serif uppercase tracking-[0.2em] animate-fade-in">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 p-2"><X size={28} /></button>
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Início</Link>
          <Link href="/catalog" onClick={() => setIsMenuOpen(false)}>Coleções</Link>
          <Link href="/gifts" onClick={() => setIsMenuOpen(false)}>Presentes</Link>
          <Link href="/cart" onClick={() => setIsMenuOpen(false)}>Minha Sacola</Link>
        </div>
      )}

      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end space-y-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="bg-[#212529] text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4 animate-slide-up pointer-events-auto">
            <CheckCircle2 size={18} className="text-[#D5BDAF]" />
            <span className="text-xs uppercase tracking-widest font-bold">{n.message}</span>
          </div>
        ))}
      </div>

      {!isAdminPage && settings.whatsappNumber && (
        <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 group">
          <div className="relative">
            <MessageCircle size={32} fill="white" className="text-white" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse border-2 border-white">1</span>
          </div>
        </a>
      )}

      <main className={`flex-grow ${isHomePage && !isAdminPage ? '-mt-[73px]' : ''}`}>
        {children}
      </main>

      {!isAdminPage && (
        <footer className="bg-[#FAF7F2] py-20 px-6 md:px-12 text-[#212529]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div>
              <div className="mb-8">
                <h2 className="font-serif text-2xl tracking-widest uppercase">{settings.logoText}</h2>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-8 font-light">{settings.footerContent}</p>
            </div>
            <div>
              <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-gray-400">Explore</h3>
              <ul className="space-y-4 text-[11px] text-gray-600 uppercase tracking-widest">
                <li><Link href="/catalog">Ver Catálogo</Link></li>
                <li><Link href="/gifts">Presentes</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-gray-400">Institucional</h3>
              <ul className="space-y-4 text-[11px] text-gray-600 uppercase tracking-widest">
                <li><Link href="/policy/returns">Trocas e Devoluções</Link></li>
                <li><Link href="/policy/warranty">Garantia</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-gray-400">Atendimento</h3>
              <p className="text-sm text-gray-600 mb-2 font-light">Email: {settings.contactEmail}</p>
            </div>
          </div>
          <div className="mt-24 pt-8 border-t border-gray-100 text-center text-[10px] text-gray-400 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} {settings.logoText}. Design Minimalista & Essencial.
          </div>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;