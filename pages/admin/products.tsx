import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Search, Edit2, Trash2, X, Save } from 'lucide-react';
import { Product } from '@/types';

export default function AdminProducts() {
  const { products, setProducts, settings, showNotification } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (!editing?.name || !editing?.price) return;
    if (editing.id) {
      setProducts(products.map(p => p.id === editing.id ? (editing as Product) : p));
    } else {
      const newP = { ...editing, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() } as Product;
      setProducts([...products, newP]);
    }
    setShowModal(false);
    showNotification("Catálogo atualizado! ✨");
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif">Gestão de Peças</h1>
          <button onClick={() => { setEditing({ images: [], tags: [] }); setShowModal(true); }} className="bg-[#212529] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Plus size={16} /> Nova Joia
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center gap-4">
            <Search className="text-gray-300" size={18} />
            <input type="text" placeholder="Buscar..." className="bg-transparent outline-none flex-grow text-sm" onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="p-6 px-10">Peça</th>
                <th className="p-6">Preço</th>
                <th className="p-6 text-right px-10">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-6 px-10 flex items-center gap-4">
                    <img src={p.images[0]} className="w-10 h-12 object-cover rounded-lg" />
                    <span className="font-serif">{p.name}</span>
                  </td>
                  <td className="p-6 font-bold">R$ {p.price.toFixed(2)}</td>
                  <td className="p-6 text-right px-10">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-2 hover:text-[#D5BDAF]"><Edit2 size={16} /></button>
                      <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-2 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 space-y-8 animate-slide-up">
            <h2 className="text-2xl font-serif">{editing?.id ? 'Editar' : 'Nova'} Peça</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={editing?.name || ''} className="w-full p-4 bg-gray-50 rounded-full outline-none" onChange={e => setEditing({...editing!, name: e.target.value})} />
              <input type="number" placeholder="Preço" value={editing?.price || ''} className="w-full p-4 bg-gray-50 rounded-full outline-none" onChange={e => setEditing({...editing!, price: parseFloat(e.target.value)})} />
              <textarea placeholder="Descrição" value={editing?.description || ''} className="w-full p-4 bg-gray-50 rounded-[2rem] outline-none h-24" onChange={e => setEditing({...editing!, description: e.target.value})} />
              <input type="text" placeholder="URL da Imagem" className="w-full p-4 bg-gray-50 rounded-full outline-none" onChange={e => setEditing({...editing!, images: [e.target.value]})} />
            </div>
            <div className="flex justify-end gap-4 border-t pt-8">
              <button onClick={() => setShowModal(false)} className="text-gray-400 uppercase font-bold text-[10px] tracking-widest">Cancelar</button>
              <button onClick={handleSave} className="bg-[#212529] text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}