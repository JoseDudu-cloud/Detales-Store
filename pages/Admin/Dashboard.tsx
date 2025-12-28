
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { BarChart, Users, ShoppingCart, MessageSquare, TrendingUp, Eye, Package, DollarSign, Radio } from 'lucide-react';
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { analytics, products, settings, setSettings, showNotification } = useStore();
  const [isClient, setIsClient] = useState(false);

  // Recharts needs to wait for mount to calculate container size correctly
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleLive = () => {
    const nextState = !(settings?.isLiveOn ?? false);
    setSettings({ ...settings, isLiveOn: nextState });
    showNotification(nextState ? "Live iniciada! ✨" : "Live finalizada.");
  };

  const stats = [
    { label: 'Visitantes', value: analytics?.visitors ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Visualizações', value: analytics?.productViews ?? 0, icon: Eye, color: 'text-purple-500' },
    { label: 'Carrinhos', value: analytics?.addedToCart ?? 0, icon: ShoppingCart, color: 'text-orange-500' },
    { label: 'Checkouts Zap', value: analytics?.whatsappCheckouts ?? 0, icon: MessageSquare, color: 'text-green-500' },
  ];

  const bestSellersData = [...(products || [])]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map(p => ({ name: (p.name || '').split(' ')[0], views: p.viewCount || 0 }));

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-serif">Visão Geral</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Como anda sua loja hoje</p>
        </div>
        
        <button 
          onClick={toggleLive}
          className={`flex items-center space-x-3 px-8 py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg transition-all border-2 ${settings?.isLiveOn ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
        >
          <div className={`w-2 h-2 rounded-full ${settings?.isLiveOn ? 'bg-red-600 animate-pulse' : 'bg-gray-400'}`} />
          <Radio size={14} />
          <span>{settings?.isLiveOn ? 'Live está ONLINE' : 'Iniciar Live Commerce'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-full bg-gray-50 ${s.color}`}>
                <s.icon size={20} />
              </div>
              <span className="text-[10px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-700">Produtos Mais Visualizados</h3>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <div className="h-64 w-full min-h-[250px] relative">
            {isClient && (
              <div style={{ width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={bestSellersData}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                      {bestSellersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#D5BDAF' : '#F5EBE0'} />
                      ))}
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="font-bold uppercase tracking-widest text-xs text-gray-700 mb-8">Resumo de Atividade</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-[#FAF7F2] rounded-3xl">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-full shadow-sm"><Package size={16} /></div>
                <div>
                  <p className="text-sm font-bold">Estoque Baixo</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Atenção requerida</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-[#FAF7F2] rounded-3xl">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-full shadow-sm"><DollarSign size={16} /></div>
                <div>
                  <p className="text-sm font-bold">Ticket Médio</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Monitoramento global</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
