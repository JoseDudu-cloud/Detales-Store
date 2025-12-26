import React, { useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { Users, Eye, ShoppingBag, MessageCircle, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { admin, analytics } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!admin) router.push('/admin/login');
  }, [admin]);

  if (!admin) return null;

  const stats = [
    { label: 'Visitantes', value: analytics.visitors, icon: Users, color: 'text-blue-500' },
    { label: 'Visualizações', value: analytics.productViews, icon: Eye, color: 'text-purple-500' },
    { label: 'Carrinhos', value: analytics.addedToCart, icon: ShoppingBag, color: 'text-orange-500' },
    { label: 'WhatsApp', value: analytics.whatsappCheckouts, icon: MessageCircle, color: 'text-green-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-serif">Painel de Controle</h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className={`p-3 rounded-full bg-gray-50 ${s.color} w-fit mb-4`}>
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-700">Desempenho da Loja</h3>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <div className="h-48 flex items-center justify-center text-gray-300 italic text-sm">
            Gráfico de conversão em tempo real sendo processado...
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}