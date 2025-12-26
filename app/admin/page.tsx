"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useRouter } from 'next/navigation';
import { Users, Eye, ShoppingCart, MessageSquare, TrendingUp, Package, DollarSign, Radio, LayoutDashboard, Settings as SettingsIcon, LogOut, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const AdminDashboard: React.FC = () => {
  const { admin, analytics, settings, setSettings, showNotification, logout } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!admin) router.push('/admin/login');
  }, [admin, router]);

  if (!admin) return null;

  const toggleLive = () => {
    const nextState = !settings.isLiveOn;
    setSettings({ ...settings, isLiveOn: nextState });
    showNotification(nextState ? "Live iniciada! ✨" : "Live finalizada.");
  };

  const stats = [
    { label: 'Visitantes', value: analytics.visitors, icon: Users, color: 'text-blue-500' },
    { label: 'Visualizações', value: analytics.productViews, icon: Eye, color: 'text-purple-500' },
    { label: 'Carrinhos', value: analytics.addedToCart, icon: ShoppingCart, color: 'text-orange-500' },
    { label: 'Checkouts Zap', value: analytics.whatsappCheckouts, icon: MessageSquare, color: 'text-green-500' },
  ];

  return (
    <div className="min-h-screen flex bg-[#FDFBF9]">
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed inset-y-0 z-50">
        <div className="p-10 border-b border-gray-50 text-center">
          <h2 className="font-serif text-xl tracking-[0.2em] font-bold">DETALHES <span className="text-[#D5BDAF]">ADM</span></h2>
        </div>
        <nav className="flex-grow p-6 space-y-4 pt-12">
          <Link href="/admin" className="flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold bg-[#212529] text-white rounded-full shadow-xl">
            <LayoutDashboard size={16} /><span>Painel</span>
          </Link>
          <Link href="/admin/products" className="flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 hover:bg-gray-50">
            <Package size={16} /><span>Produtos</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400 hover:bg-gray-50">
            <SettingsIcon size={16} /><span>Configurações</span>
          </Link>
        </nav>
        <div className="p-8 border-t border-gray-50">
          <button onClick={logout} className="w-full flex items-center space-x-4 px-8 py-5 text-[10px] uppercase tracking-[0.25em] font-bold text-red-400 hover:bg-red-50 rounded-full">
            <LogOut size={16} /><span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow lg:ml-64 p-8 md:p-16">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-serif">Visão Geral</h1>
              <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Status atual da loja</p>
            </div>
            <button 
              onClick={toggleLive}
              className={`flex items-center space-x-3 px-8 py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg transition-all border-2 ${settings.isLiveOn ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
            >
              <Radio size={14} className={settings.isLiveOn ? 'animate-pulse' : ''} />
              <span>{settings.isLiveOn ? 'Live está ONLINE' : 'Iniciar Live Commerce'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className={`p-2 rounded-full bg-gray-50 ${s.color} w-fit mb-4`}><s.icon size={20} /></div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-700 mb-8">Resumo de Atividade</h3>
            <div className="flex items-center justify-between p-6 bg-[#FAF7F2] rounded-3xl">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-full shadow-sm"><DollarSign size={16} /></div>
                <div>
                  <p className="text-sm font-bold">Ticket Médio</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Calculado em R$ 245,00</p>
                </div>
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;