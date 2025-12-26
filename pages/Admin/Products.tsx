
import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Plus, Search, Edit2, Trash2, Save, X, ImageIcon, Upload, Image as ImageLucide, Package } from 'lucide-react';
import { Product } from '../../types';

const AdminProducts: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!editingProduct?.name || !editingProduct?.price) return alert('Nome e Preço são obrigatórios!');
    if (!editingProduct?.images || editingProduct.images.length === 0) return alert('Pelo menos uma imagem é obrigatória!');
    
    if (editingProduct.id) {
        updateProduct(editingProduct as Product);
    } else {
        const newProduct: Product = {
            ...editingProduct as Product,
            id: Math.random().toString(36).substr(2, 9),
            viewCount: 0,
            cartAddCount: 0,
            createdAt: Date.now(),
            tags: editingProduct.tags || [],
            images: editingProduct.images || []
        };
        addProduct(newProduct);
    }
    setShowModal(false);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este detalhe do catálogo?')) {
        deleteProduct(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditingProduct(prev => ({
          ...prev,
          images: [...(prev?.images || []), base64String]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setEditingProduct(prev => ({
      ...prev,
      images: (prev?.images || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in pb-20 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif">Gestão de Catálogo</h1>
          <p className="text-[10px] md:text-sm text-gray-500 uppercase tracking-widest mt-1">{products.length} itens ativos</p>
        </div>
        <button 
          onClick={() => { setEditingProduct({ tags: [], isGift: false, stock: 10, images: [] }); setShowModal(true); }}
          className="w-full md:w-auto bg-[#212529] text-white px-8 py-4 md:px-10 md:py-5 rounded-full uppercase tracking-[0.25em] text-[10px] font-bold hover:bg-black transition-all flex items-center justify-center space-x-3 shadow-xl"
        >
          <Plus size={16} />
          <span>Nova Joia</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-10 border-b border-gray-50">
          <div className="relative w-full max-w-xl mx-auto md:mx-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-4 md:py-5 rounded-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#D5BDAF] outline-none text-sm transition"
            />
          </div>
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
                <th className="px-10 py-6">Peça</th>
                <th className="px-10 py-6">Valor</th>
                <th className="px-10 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/30 transition group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100">
                        {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <ImageLucide className="mx-auto mt-6 text-gray-300"/>}
                      </div>
                      <div>
                        <p className="font-serif text-lg text-gray-800">{product.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-[#D5BDAF] font-bold mt-1">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 font-bold text-sm">R$ {product.price.toFixed(2)}</td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => handleEdit(product)} className="p-3 bg-white shadow rounded-full hover:text-[#D5BDAF] transition"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-3 bg-white shadow rounded-full hover:text-red-500 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet View (Cards) */}
        <div className="lg:hidden p-4 space-y-4">
           {filteredProducts.map(product => (
             <div key={product.id} className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-white flex-shrink-0">
                   {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-gray-200" />}
                </div>
                <div className="flex-grow min-w-0">
                   <h3 className="font-serif text-sm font-bold truncate">{product.name}</h3>
                   <p className="text-[9px] uppercase tracking-widest text-[#D5BDAF] font-bold">{product.category}</p>
                   <p className="text-sm font-bold mt-2">R$ {product.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-2">
                   <button onClick={() => handleEdit(product)} className="p-3 bg-white shadow rounded-full text-gray-500"><Edit2 size={14} /></button>
                   <button onClick={() => handleDelete(product.id)} className="p-3 bg-white shadow rounded-full text-red-400"><Trash2 size={14} /></button>
                </div>
             </div>
           ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in overflow-hidden">
          <div className="bg-white w-full max-w-5xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl p-6 md:p-12 max-h-[90vh] md:max-h-[95vh] overflow-y-auto space-y-8 md:space-y-12 scrollbar-hide">
            <div className="flex justify-between items-center sticky top-0 bg-white z-10 pb-4 md:pb-0">
              <h2 className="text-xl md:text-3xl font-serif">{editingProduct?.id ? 'Editar Peça' : 'Adicionar ao Catálogo'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition"><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              <div className="md:col-span-5 space-y-4 md:space-y-6">
                <label className="text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">Imagens da Peça</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-4">
                    {editingProduct?.images?.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"><Trash2 size={12}/></button>
                      </div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center hover:bg-gray-50 transition min-h-[120px]">
                      <Upload size={20} className="text-gray-400"/>
                      <span className="text-[10px] uppercase font-bold text-gray-400 mt-2">Enviar</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" multiple accept="image/*" />
                </div>
              </div>

              <div className="md:col-span-7 space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Nome da Peça</label>
                        <input type="text" value={editingProduct?.name || ''} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-6 py-4 rounded-full bg-gray-50 border focus:bg-white outline-none text-sm"/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Categoria</label>
                        <div className="relative">
                          <select 
                              value={editingProduct?.category || ''} 
                              onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                              className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm appearance-none focus:bg-white"
                          >
                              <option value="">Selecione...</option>
                              {settings.categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Preço (R$)</label>
                        <input type="number" step="0.01" value={editingProduct?.price || ''} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm focus:bg-white"/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Estoque</label>
                        <input type="number" value={editingProduct?.stock || 0} onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm focus:bg-white"/>
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                        {settings.tags.map(t => (
                            <button 
                                key={t}
                                onClick={() => {
                                    const currentTags = editingProduct?.tags || [];
                                    const nextTags = currentTags.includes(t) ? currentTags.filter(item => item !== t) : [...currentTags, t];
                                    setEditingProduct({...editingProduct, tags: nextTags});
                                }}
                                className={`px-4 py-2 rounded-full text-[9px] uppercase font-bold tracking-widest transition-all ${editingProduct?.tags?.includes(t) ? 'bg-[#212529] text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Descrição Curta</label>
                  <textarea 
                    value={editingProduct?.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full px-6 py-4 rounded-[2rem] bg-gray-50 border outline-none text-sm h-32 focus:bg-white resize-none"
                    placeholder="Ex: Semijoia banhada a ouro 18k com acabamento premium..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end pt-8 border-t gap-4">
              <button onClick={() => setShowModal(false)} className="order-2 md:order-1 px-10 py-5 uppercase tracking-[0.25em] text-[10px] font-bold text-gray-400 hover:text-black transition-colors">Cancelar</button>
              <button onClick={handleSave} className="order-1 md:order-2 px-16 py-5 uppercase tracking-[0.3em] text-[10px] font-bold bg-[#212529] text-white rounded-full shadow-2xl flex items-center justify-center space-x-3 transition-transform active:scale-95"><Save size={16} /><span>Salvar Joia</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
