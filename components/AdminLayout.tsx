
"use client";

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Settings as SettingsIcon, LogOut, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { logout } = useStore();

  const navItems = [
    { label: 'Painel', path: '/admin', icon: LayoutDashboard },
    { label: 'Produtos', path: '/admin/products', icon: Package },
    { label: 'Configurações', path: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#FDFBF9]">
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed inset-y-0 z-50 shadow-sm">
        <div className="p-10 border-b border-gray-50 text-center">
          <h2 className="font-serif text-xl tracking-[0.2em] font-bold">DETALHES <span className="text-[#D5BDAF]">ADM</span></h2>
        </div>
        <nav className="flex-grow p-6 space-y-4 pt-12">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold transition-all rounded-full ${pathname === item.path ? 'bg-[#212529] text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-8 border-t border-gray-50 space-y-2">
          <Link href="/" className="flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 hover:text-black rounded-full">
            <ChevronLeft size={16} />
            <span>Loja</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold text-red-400 hover:bg-red-50 rounded-full">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow lg:ml-64 p-8 md:p-16">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
