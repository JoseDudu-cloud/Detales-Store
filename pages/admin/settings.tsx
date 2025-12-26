import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import AdminLayout from '@/components/AdminLayout';
import { Save, Layout, MessageCircle, Radio } from 'lucide-react';

export default function AdminSettings() {
  const { settings, setSettings, showNotification } = useStore();
  const [local, setLocal] = useState(settings);

  const handleSave = () => {
    setSettings(local);
    showNotification("Marca atualizada com sucesso! ✨");
  };

  return (
    <AdminLayout>
      <div className="space-y-12 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif">Configurações</h1>
          <button onClick={handleSave} className="bg-[#212529] text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl">
            <Save size={18} /> Salvar Alterações
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h2 className="text-xl font-serif flex items-center gap-3 border-b pb-6 text-gray-800">
              <Layout size={20} className="text-[#D5BDAF]" /> Identidade Visual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Nome da Loja</label>
                <input type="text" value={local.logoText} className="w-full p-4 bg-gray-50 rounded-full outline-none focus:bg-white border transition" onChange={e => setLocal({...local, logoText: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Cor Principal</label>
                <div className="flex gap-4 items-center">
                  <input type="color" value={local.primaryColor} className="w-12 h-12 rounded-full cursor-pointer border-none" onChange={e => setLocal({...local, primaryColor: e.target.value})} />
                  <span className="font-mono text-sm uppercase">{local.primaryColor}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h2 className="text-xl font-serif flex items-center gap-3 border-b pb-6 text-gray-800">
              <MessageCircle size={20} className="text-[#25D366]" /> WhatsApp & Atendimento
            </h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Número do WhatsApp (DDI+DDD+Número)</label>
                <input type="text" value={local.whatsappNumber} className="w-full p-4 bg-gray-50 rounded-full outline-none focus:bg-white border transition" onChange={e => setLocal({...local, whatsappNumber: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Template de Mensagem</label>
                <textarea value={local.whatsappTemplateRegular} className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none h-32 focus:bg-white border transition text-sm" onChange={e => setLocal({...local, whatsappTemplateRegular: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[3rem] border border-gray-100 flex justify-between items-center shadow-sm">
            <h2 className="text-xl font-serif flex items-center gap-3">
              <Radio size={20} className={local.isLiveOn ? 'text-red-500' : 'text-gray-300'} /> Modo Live Commerce
            </h2>
            <button 
              onClick={() => setLocal({...local, isLiveOn: !local.isLiveOn})}
              className={`w-14 h-8 rounded-full relative transition-all ${local.isLiveOn ? 'bg-red-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${local.isLiveOn ? 'right-1' : 'left-1'}`} />
            </button>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}