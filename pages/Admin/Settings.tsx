
import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { 
  Save, Check, ImageIcon, Type, Trash2, ShieldCheck, 
  UserPlus, Radio, Plus, Eye, EyeOff, MessageSquare, 
  Tag as TagIcon, Layout, Image as ImageLucide, Link as LinkIcon, X, Lock, User, 
  Instagram, Facebook, Mail, Globe, Info, Truck, Pencil, Sparkles, ArrowLeft, Upload,
  Phone, MessageCircle, Code, HelpCircle, Star, Key, Hash
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { settings, setSettings, adminUsers, deleteAdminUser, createAdminUser, updateAdminUser, showNotification } = useStore();
  
  // Defensive initialization for local state
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [saved, setSaved] = useState(false);
  
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newHotbarText, setNewHotbarText] = useState('');

  const [editingHotbarId, setEditingHotbarId] = useState<string | null>(null);
  const [tempHotbarText, setTempHotbarText] = useState('');

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{id?: string, username: string, password?: string, role: 'superadmin' | 'editor'} | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = () => {
    setSettings(localSettings);
    setSaved(true);
    showNotification("Configurações atualizadas com sucesso! ✨");
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field: string, value: string) => {
    setLocalSettings(prev => ({
        ...prev,
        socialLinks: { ...(prev?.socialLinks || {}), [field]: value }
    }));
  };

  const updateInstitutional = (field: string, value: string) => {
    setLocalSettings(prev => ({
        ...prev,
        institutional: { ...(prev?.institutional || {}), [field]: value }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'heroImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateField(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const addItem = (field: 'categories' | 'tags', value: string, resetter: (v: string) => void) => {
    if (!value) return;
    if (((localSettings[field] as string[]) || []).includes(value)) {
      showNotification("Este item já existe.");
      return;
    }
    updateField(field, [...((localSettings[field] as string[]) || []), value]);
    resetter('');
  };

  const removeItem = (field: 'categories' | 'tags', value: string) => {
    updateField(field, ((localSettings[field] as string[]) || []).filter(item => item !== value));
  };

  const addHotbarMessage = () => {
    if (!newHotbarText) return;
    const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: newHotbarText.toUpperCase(),
        enabled: true
    };
    updateField('hotbarMessages', [...(localSettings?.hotbarMessages || []), newMessage]);
    setNewHotbarText('');
  };

  const addTestimonial = () => {
    const newT = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nome da Cliente',
      text: 'Depoimento incrível...',
      rating: 5,
      enabled: true
    };
    updateField('testimonials', [...(localSettings?.testimonials || []), newT]);
  };

  const removeTestimonial = (id: string) => {
    updateField('testimonials', (localSettings?.testimonials || []).filter(t => t.id !== id));
  };

  const updateTestimonial = (id: string, updates: any) => {
    updateField('testimonials', (localSettings?.testimonials || []).map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addFaq = () => {
    const newF = {
      id: Math.random().toString(36).substr(2, 9),
      question: 'Nova Pergunta?',
      answer: 'Resposta detalhada...',
      enabled: true
    };
    updateField('faqs', [...(localSettings?.faqs || []), newF]);
  };

  const removeFaq = (id: string) => {
    updateField('faqs', (localSettings?.faqs || []).filter(f => f.id !== id));
  };

  const updateFaq = (id: string, updates: any) => {
    updateField('faqs', (localSettings?.faqs || []).map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const startEditingHotbar = (msg: {id: string, text: string}) => {
    setEditingHotbarId(msg.id);
    setTempHotbarText(msg.text);
  };

  const saveHotbarEdit = (id: string) => {
    updateField('hotbarMessages', (localSettings?.hotbarMessages || []).map(m => 
        m.id === id ? { ...m, text: tempHotbarText.toUpperCase() } : m
    ));
    setEditingHotbarId(null);
  };

  const handleSaveUser = async () => {
    if (!editingUser?.username) return;
    try {
      if (editingUser.id) {
        await updateAdminUser(editingUser.id, editingUser.username, editingUser.password);
        showNotification("Usuário atualizado!");
      } else {
        if (!editingUser.password) return alert("Senha é obrigatória");
        const encoder = new TextEncoder();
        const data = encoder.encode(editingUser.password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        createAdminUser(editingUser.username, hash, editingUser.role);
        showNotification("Novo admin criado!");
      }
      setShowUserModal(false);
      setEditingUser(null);
    } catch (e) {
      showNotification("Erro ao salvar.");
    }
  };

  // Instagram Management
  const addInstagramPost = () => {
    const newPost = { id: Math.random().toString(36).substr(2, 9), imageUrl: '' };
    updateField('instagramSection', {
      ...(localSettings?.instagramSection || {}),
      posts: [...(localSettings?.instagramSection?.posts || []), newPost]
    });
  };

  const updateInstagramPost = (id: string, url: string) => {
    updateField('instagramSection', {
      ...localSettings?.instagramSection,
      posts: (localSettings?.instagramSection?.posts || []).map(p => p.id === id ? { ...p, imageUrl: url } : p)
    });
  };

  const removeInstagramPost = (id: string) => {
    updateField('instagramSection', {
      ...localSettings?.instagramSection,
      posts: (localSettings?.instagramSection?.posts || []).filter(p => p.id !== id)
    });
  };

  const menuItems = [
    { label: 'Logo', id: 'sec-logo' },
    { label: 'Banner', id: 'sec-banner' },
    { label: 'WhatsApp', id: 'sec-checkout' },
    { label: 'Redes', id: 'sec-social' },
    { label: 'Live', id: 'sec-live' },
    { label: 'Institucional', id: 'sec-inst' },
    { label: 'Hotbar', id: 'sec-hotbar' },
    { label: 'Depoimentos', id: 'sec-testimonials' },
    { label: 'Instagram', id: 'sec-instagram' },
    { label: 'FAQ', id: 'sec-faq' },
    { label: 'Tags', id: 'sec-taxonomy' },
    { label: 'Acessos', id: 'sec-security' }
  ];

  return (
    <div className="max-w-5xl space-y-12 pb-32 animate-fade-in relative px-1 w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif">Configurações</h1>
          <p className="text-[10px] md:text-sm text-gray-500 uppercase tracking-widest mt-1 italic">Gestão completa da marca</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className={`w-full md:w-auto flex items-center justify-center space-x-3 px-12 py-5 uppercase tracking-[0.25em] text-[10px] font-bold text-white transition-all rounded-full shadow-2xl ${saved ? 'bg-green-500' : 'bg-[#212529] hover:bg-black hover:-translate-y-1'}`}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          <span>{saved ? 'Alterações Salvas' : 'Salvar Tudo'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 relative">
        {/* Navigation - optimized for mobile */}
        <div className="lg:col-span-1">
            <nav className="sticky top-20 md:top-32 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-2 lg:space-x-0 lg:space-y-1 bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-full md:rounded-[2.5rem] border border-gray-100 shadow-sm scrollbar-hide z-30 mx-4 md:mx-0">
                {menuItems.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => scrollToSection(item.id)}
                      className="whitespace-nowrap flex-shrink-0 text-left px-5 md:px-6 py-2.5 md:py-4 rounded-full md:rounded-2xl text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-gray-500 bg-gray-50 md:bg-transparent hover:text-black hover:bg-[#FAF7F2] transition-all border border-transparent shadow-sm md:shadow-none"
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="lg:col-span-3 space-y-8 md:space-y-12 px-4 md:px-0">
          
          {/* Logo Section */}
          <section id="sec-logo" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><Layout size={20} className="text-[#D5BDAF]" /><span>Logo da Loja</span></h2>
            <div className="space-y-6">
                <div className="flex p-1.5 bg-gray-50 rounded-full w-full max-w-sm mx-auto md:mx-0">
                  <button onClick={() => updateField('logoType', 'text')} className={`flex-1 py-3 flex items-center justify-center space-x-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition ${localSettings?.logoType === 'text' ? 'bg-white shadow-md text-black' : 'text-gray-400'}`}><Type size={14} /><span>Texto</span></button>
                  <button onClick={() => updateField('logoType', 'image')} className={`flex-1 py-3 flex items-center justify-center space-x-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition ${localSettings?.logoType === 'image' ? 'bg-white shadow-md text-black' : 'text-gray-400'}`}><ImageIcon size={14} /><span>Imagem</span></button>
                </div>
                
                {localSettings?.logoType === 'text' ? (
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-4 italic">Nome da Marca</label>
                     <input type="text" value={localSettings?.logoText || ''} onChange={(e) => updateField('logoText', e.target.value)} className="w-full px-6 md:px-8 py-4 rounded-full bg-gray-50 border outline-none text-sm focus:bg-white transition shadow-inner" placeholder="Ex: DETALHES"/>
                   </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <div className="w-32 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                       {localSettings?.logoUrl ? <img src={localSettings.logoUrl} className="max-w-full max-h-full object-contain p-2" /> : <ImageIcon size={24} className="text-gray-200"/>}
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                       <button 
                         onClick={() => logoInputRef.current?.click()}
                         className="bg-[#212529] text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition flex items-center gap-3 mx-auto sm:mx-0"
                       >
                         <Upload size={14} />
                         Upar Logo
                       </button>
                       <p className="text-[9px] text-gray-400 mt-3 uppercase tracking-widest italic">PNG transparente recomendado</p>
                       <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logoUrl')} className="hidden" accept="image/*" />
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* Banner Section */}
          <section id="sec-banner" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><ImageLucide size={20} className="text-[#D5BDAF]" /><span>Banner Principal</span></h2>
            <div className="space-y-6">
                <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-100 shadow-inner group">
                    {localSettings?.heroImageUrl ? (
                       <img src={localSettings.heroImageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <ImageLucide size={48} strokeWidth={1} />
                        <span className="text-[10px] uppercase tracking-widest font-bold mt-4">Sem imagem</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => heroInputRef.current?.click()} className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl">Alterar Banner</button>
                    </div>
                    <input type="file" ref={heroInputRef} onChange={(e) => handleImageUpload(e, 'heroImageUrl')} className="hidden" accept="image/*" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-4 italic">Headline</label>
                    <input type="text" value={localSettings?.headline || ''} onChange={(e) => updateField('headline', e.target.value)} className="w-full px-8 py-4 rounded-full bg-gray-50 border outline-none text-sm focus:bg-white"/>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-4 italic">Subheadline</label>
                   <textarea value={localSettings?.subheadline || ''} onChange={(e) => updateField('subheadline', e.target.value)} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-sm h-32 resize-none focus:bg-white shadow-inner" placeholder="Ex: Semijoias que traduzem sua essência..."/>
                </div>
            </div>
          </section>

          {/* Checkout & WhatsApp */}
          <section id="sec-checkout" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><MessageCircle size={20} className="text-[#25D366]" /><span>Checkout & WhatsApp</span></h2>
            
            <div className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2"><Phone size={12}/> Número WhatsApp (DDI+DDD+Número)</label>
                    <input type="text" value={localSettings?.whatsappNumber || ''} onChange={(e) => updateField('whatsappNumber', e.target.value)} className="w-full px-6 md:px-8 py-4 rounded-full bg-gray-50 border outline-none text-sm font-mono shadow-inner" placeholder="Ex: 5511999999999"/>
                    <p className="text-[9px] text-gray-400 ml-4 italic uppercase">Este número receberá os pedidos finalizados.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between ml-4">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2"><Code size={12}/> Template: Compra Regular</label>
                        <span className="text-[8px] bg-blue-50 text-blue-500 px-2 py-1 rounded-full uppercase font-bold">Padrão</span>
                    </div>
                    <textarea 
                        value={localSettings?.whatsappTemplateRegular || ''} 
                        onChange={(e) => updateField('whatsappTemplateRegular', e.target.value)} 
                        className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-xs h-32 resize-none leading-relaxed focus:bg-white transition shadow-inner font-mono" 
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between ml-4">
                        <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-2"><Radio size={12}/> Template: Compra em Live</label>
                        <span className="text-[8px] bg-red-50 text-red-500 px-2 py-1 rounded-full uppercase font-bold">Urgência</span>
                    </div>
                    <textarea 
                        value={localSettings?.whatsappTemplateLive || ''} 
                        onChange={(e) => updateField('whatsappTemplateLive', e.target.value)} 
                        className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-xs h-32 resize-none leading-relaxed focus:bg-white transition shadow-inner font-mono" 
                    />
                </div>

                <div className="p-6 bg-[#FAF7F2] rounded-3xl space-y-3">
                    <h4 className="text-[9px] uppercase font-bold tracking-widest text-gray-500 border-b border-gray-200/50 pb-2">Tags Inteligentes</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="text-[9px] text-gray-500 flex items-center gap-2"><code>{'{productList}'}</code> <span>Lista as peças</span></div>
                        <div className="text-[9px] text-gray-500 flex items-center gap-2"><code>{'{totalPrice}'}</code> <span>Valor final</span></div>
                        <div className="text-[9px] text-gray-500 flex items-center gap-2"><code>{'{liveCode}'}</code> <span>Código da live</span></div>
                    </div>
                </div>
            </div>
          </section>

          {/* Redes Sociais */}
          <section id="sec-social" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><Globe size={20} className="text-[#D5BDAF]" /><span>Redes Sociais</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2"><Instagram size={12}/> Instagram</label>
                    <input type="text" value={localSettings?.socialLinks?.instagram || ''} onChange={(e) => updateSocial('instagram', e.target.value)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2"><Facebook size={12}/> Facebook</label>
                    <input type="text" value={localSettings?.socialLinks?.facebook || ''} onChange={(e) => updateSocial('facebook', e.target.value)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2">TikTok</label>
                    <input type="text" value={localSettings?.socialLinks?.tiktok || ''} onChange={(e) => updateSocial('tiktok', e.target.value)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2"><Mail size={12}/> Email Atendimento</label>
                    <input type="text" value={localSettings?.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
                </div>
            </div>
          </section>

          {/* Live Commerce */}
          <section id="sec-live" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm scroll-mt-36 md:scroll-mt-32">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif flex items-center space-x-3"><Radio size={20} className={localSettings?.isLiveOn ? 'text-red-500' : 'text-gray-300'} /><span>Live Commerce Ativa?</span></h2>
                <button onClick={() => updateField('isLiveOn', !localSettings?.isLiveOn)} className={`w-14 h-7 rounded-full relative transition-all ${localSettings?.isLiveOn ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-gray-200'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings?.isLiveOn ? 'right-1' : 'left-1'}`} /></button>
             </div>
          </section>

          {/* Institucional Section */}
          <section id="sec-inst" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><Info size={20} className="text-[#D5BDAF]" /><span>Políticas & Institucional</span></h2>
            <div className="space-y-8">
                {[
                  { key: 'about', label: 'Sobre a Marca', icon: <Sparkles size={14}/> },
                  { key: 'shipping', label: 'Política de Envio', icon: <Truck size={14}/> },
                  { key: 'returns', label: 'Trocas e Devoluções', icon: <ArrowLeft size={14}/> },
                  { key: 'warranty', label: 'Garantia Premium', icon: <ShieldCheck size={14}/> }
                ].map(item => (
                  <div key={item.key} className="space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-4 flex items-center gap-2">
                        {item.icon} {item.label}
                    </label>
                    <textarea 
                      value={(localSettings?.institutional as any)?.[item.key] || ''} 
                      onChange={(e) => updateInstitutional(item.key, e.target.value)} 
                      className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-xs h-32 md:h-40 resize-none leading-relaxed focus:bg-white transition shadow-inner" 
                      placeholder={`Escreva aqui sobre ${item.label.toLowerCase()}...`}
                    />
                  </div>
                ))}
            </div>
          </section>

          {/* Hotbar */}
          <section id="sec-hotbar" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <h2 className="text-xl font-serif border-b border-gray-50 pb-6 flex items-center space-x-3"><MessageSquare size={20} className="text-[#D5BDAF]" /><span>Hotbar de Avisos</span></h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" value={newHotbarText} onChange={(e) => setNewHotbarText(e.target.value)} placeholder="Novo Aviso..." className="flex-grow px-8 py-4 rounded-full bg-gray-50 border outline-none text-xs uppercase focus:bg-white shadow-inner" />
                <button onClick={addHotbarMessage} className="bg-[#212529] text-white p-4 rounded-full flex justify-center items-center shadow-xl transition-transform active:scale-90"><Plus size={18} /></button>
            </div>
            <div className="space-y-3">
                {(localSettings?.hotbarMessages || []).map(msg => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col sm:flex-row items-center justify-between group gap-4 border border-transparent hover:border-gray-100 transition-all">
                        {editingHotbarId === msg.id ? (
                           <div className="w-full flex items-center gap-3">
                              <input 
                                 type="text" 
                                 value={tempHotbarText} 
                                 onChange={(e) => setTempHotbarText(e.target.value)}
                                 className="flex-grow bg-white px-4 py-2 rounded-full border border-[#D5BDAF] text-[10px] uppercase font-bold outline-none"
                                 autoFocus
                              />
                              <button onClick={() => saveHotbarEdit(msg.id)} className="p-2 text-green-500 transition-transform active:scale-90"><Check size={14}/></button>
                              <button onClick={() => setEditingHotbarId(null)} className="p-2 text-red-400 transition-transform active:scale-90"><X size={14}/></button>
                           </div>
                        ) : (
                          <>
                            <span className={`text-[10px] font-bold uppercase tracking-widest text-center sm:text-left ${msg.enabled ? 'text-gray-800' : 'text-gray-400 italic line-through'}`}>{msg.text}</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => startEditingHotbar(msg)} className="p-2 text-gray-400 hover:text-black transition-colors" title="Editar"><Pencil size={14}/></button>
                                <button onClick={() => updateField('hotbarMessages', localSettings.hotbarMessages.map(m => m.id === msg.id ? {...m, enabled: !m.enabled} : m))} className="p-2 text-gray-400 hover:text-[#D5BDAF] transition-colors">{msg.enabled ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                                <button onClick={() => updateField('hotbarMessages', localSettings.hotbarMessages.filter(m => m.id !== msg.id))} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                            </div>
                          </>
                        )}
                    </div>
                ))}
            </div>
          </section>

          {/* Testimonials Management */}
          <section id="sec-testimonials" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <div className="flex justify-between items-center border-b border-gray-50 pb-6">
              <h2 className="text-xl font-serif flex items-center space-x-3"><Star size={20} className="text-[#D5BDAF]" /><span>Depoimentos de Clientes</span></h2>
              <button onClick={addTestimonial} className="bg-black text-white p-2 rounded-full shadow-lg"><Plus size={16}/></button>
            </div>
            <div className="space-y-6">
                {(localSettings?.testimonials || []).map((t) => (
                    <div key={t.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                        <div className="flex justify-between items-start">
                            <input 
                                type="text" 
                                value={t.name} 
                                onChange={(e) => updateTestimonial(t.id, { name: e.target.value })}
                                className="bg-transparent font-bold uppercase tracking-widest text-[10px] outline-none border-b border-gray-200 pb-1"
                                placeholder="Nome da Cliente"
                            />
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateTestimonial(t.id, { enabled: !t.enabled })} className={`p-2 transition-colors ${t.enabled ? 'text-[#D5BDAF]' : 'text-gray-300'}`}>{t.enabled ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                                <button onClick={() => removeTestimonial(t.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <textarea 
                            value={t.text} 
                            onChange={(e) => updateTestimonial(t.id, { text: e.target.value })}
                            className="w-full bg-white p-4 rounded-2xl text-[11px] outline-none h-20 resize-none shadow-inner italic"
                            placeholder="Texto do depoimento..."
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-gray-400">Avaliação:</span>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(v => (
                                    <button key={v} onClick={() => updateTestimonial(t.id, { rating: v })} className={`${t.rating >= v ? 'text-[#D5BDAF]' : 'text-gray-200'}`}><Star size={12} fill="currentColor"/></button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </section>

          {/* Instagram Management */}
          <section id="sec-instagram" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <div className="flex justify-between items-center border-b border-gray-50 pb-6">
              <h2 className="text-xl font-serif flex items-center space-x-3"><Instagram size={20} className="text-[#D5BDAF]" /><span>Instagram Showcase</span></h2>
              <button 
                onClick={() => updateField('instagramSection', { ...(localSettings?.instagramSection || {}), enabled: !(localSettings?.instagramSection?.enabled ?? false) })} 
                className={`w-14 h-7 rounded-full relative transition-all ${localSettings?.instagramSection?.enabled ? 'bg-[#D5BDAF] shadow-lg shadow-[#D5BDAF]/20' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings?.instagramSection?.enabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-4">
                  <div className="flex items-center gap-3">
                    <Radio size={16} className={localSettings?.instagramSection?.useApi ? 'text-[#D5BDAF]' : 'text-gray-400'} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Usar Instagram Graph API (Automático)</span>
                  </div>
                  <button 
                    onClick={() => updateField('instagramSection', { ...localSettings?.instagramSection, useApi: !localSettings?.instagramSection?.useApi })} 
                    className={`w-10 h-5 rounded-full relative transition-all ${localSettings?.instagramSection?.useApi ? 'bg-[#D5BDAF]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${localSettings?.instagramSection?.useApi ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                {localSettings?.instagramSection?.useApi && (
                  <div className="p-6 border border-gray-100 rounded-[2rem] space-y-6 bg-[#FAF7F2]/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2"><Key size={12}/> Access Token</label>
                        <input 
                          type="password" 
                          value={localSettings?.instagramSection?.accessToken || ''} 
                          onChange={(e) => updateField('instagramSection', { ...localSettings?.instagramSection, accessToken: e.target.value })} 
                          className="w-full px-6 py-4 rounded-full bg-white border outline-none text-sm"
                          placeholder="Instagram Graph API Token"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2"><User size={12}/> User ID</label>
                        <input 
                          type="text" 
                          value={localSettings?.instagramSection?.userId || ''} 
                          onChange={(e) => updateField('instagramSection', { ...localSettings?.instagramSection, userId: e.target.value })} 
                          className="w-full px-6 py-4 rounded-full bg-white border outline-none text-sm"
                          placeholder="Sua ID de Usuário"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4 flex items-center gap-2"><Hash size={12}/> Qtd. de Posts (6 a 9)</label>
                        <select 
                          value={localSettings?.instagramSection?.fetchCount || 8} 
                          onChange={(e) => updateField('instagramSection', { ...localSettings?.instagramSection, fetchCount: parseInt(e.target.value) })} 
                          className="w-full px-6 py-4 rounded-full bg-white border outline-none text-sm appearance-none"
                        >
                          {[6,7,8,9].map(n => <option key={n} value={n}>{n} posts</option>)}
                        </select>
                    </div>
                    <p className="text-[9px] text-gray-400 ml-4 italic">Se a API falhar ou não estiver configurada, usaremos os posts manuais abaixo como fallback.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Título da Seção</label>
                        <input 
                            type="text" 
                            value={localSettings?.instagramSection?.title || ''} 
                            onChange={(e) => updateField('instagramSection', { ...localSettings?.instagramSection, title: e.target.value })} 
                            className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Texto do Botão</label>
                        <input 
                            type="text" 
                            value={localSettings?.instagramSection?.buttonText || ''} 
                            onChange={(e) => updateField('instagramSection', { ...localSettings?.instagramSection, buttonText: e.target.value })} 
                            className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Username (ex: @detalhes)</label>
                        <input 
                            type="text" 
                            value={localSettings?.instagramSection?.username || ''} 
                            onChange={(e) => updateField('instagramSection', { ...localSettings?.instagramSection, username: e.target.value })} 
                            className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Link do Perfil</label>
                        <input 
                            type="text" 
                            value={localSettings?.instagramSection?.profileUrl || ''} 
                            onChange={(e) => updateField('instagramSection', { ...localSettings?.instagramSection, profileUrl: e.target.value })} 
                            className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Posts Manuais (Fallback)</label>
                        <button onClick={addInstagramPost} className="bg-black text-white p-2 rounded-full shadow-lg"><Plus size={16}/></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(localSettings?.instagramSection?.posts || []).map((post) => (
                            <div key={post.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
                                {post.imageUrl ? (
                                    <img src={post.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-4 justify-between">
                                    <button 
                                        onClick={() => removeInstagramPost(post.id)} 
                                        className="self-end p-2 bg-red-500 text-white rounded-full"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <input 
                                        type="text" 
                                        placeholder="URL da Imagem"
                                        value={post.imageUrl || ''}
                                        onChange={(e) => updateInstagramPost(post.id, e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white/90 text-[9px] outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </section>

          {/* FAQ Management */}
          <section id="sec-faq" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-36 md:scroll-mt-32">
            <div className="flex justify-between items-center border-b border-gray-50 pb-6">
              <h2 className="text-xl font-serif flex items-center space-x-3"><HelpCircle size={20} className="text-[#D5BDAF]" /><span>FAQ - Dúvidas Frequentes</span></h2>
              <button onClick={addFaq} className="bg-black text-white p-2 rounded-full shadow-lg"><Plus size={16}/></button>
            </div>
            <div className="space-y-6">
                {(localSettings?.faqs || []).map((f) => (
                    <div key={f.id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                        <div className="flex justify-between items-start">
                            <input 
                                type="text" 
                                value={f.question || ''} 
                                onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                                className="bg-transparent font-bold uppercase tracking-widest text-[10px] outline-none border-b border-gray-200 pb-1 w-full mr-12"
                                placeholder="Pergunta"
                            />
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateFaq(f.id, { enabled: !f.enabled })} className={`p-2 transition-colors ${f.enabled ? 'text-[#D5BDAF]' : 'text-gray-300'}`}>{f.enabled ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                                <button onClick={() => removeFaq(f.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <textarea 
                            value={f.answer || ''} 
                            onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                            className="w-full bg-white p-4 rounded-2xl text-[11px] outline-none h-24 resize-none shadow-inner"
                            placeholder="Resposta detalhada..."
                        />
                    </div>
                ))}
            </div>
          </section>

          {/* Taxonomy */}
          <section id="sec-taxonomy" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-12 scroll-mt-36 md:scroll-mt-32">
            <h2 className="text-xl font-serif border-b border-gray-50 pb-6 flex items-center space-x-3"><TagIcon size={20} className="text-[#D5BDAF]" /><span>Taxonomia da Loja</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-4 italic">Categorias</label>
                    <div className="flex gap-2"><input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="flex-grow px-6 py-3 bg-gray-50 border rounded-full text-xs outline-none focus:bg-white" /><button onClick={() => addItem('categories', newCat, setNewCat)} className="bg-black text-white p-3 rounded-full"><Plus size={14}/></button></div>
                    <div className="flex flex-wrap gap-2">{(localSettings?.categories || []).map(c => <div key={c} className="bg-gray-100 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-3">{c}<button onClick={() => removeItem('categories', c)} className="text-gray-400 hover:text-red-500">×</button></div>)}</div>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-4 italic">Tags de Destaque</label>
                    <div className="flex gap-2"><input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="flex-grow px-6 py-3 bg-gray-50 border rounded-full text-xs outline-none focus:bg-white" /><button onClick={() => addItem('tags', newTag, setNewTag)} className="bg-black text-white p-3 rounded-full"><Plus size={14}/></button></div>
                    <div className="flex flex-wrap gap-2">{(localSettings?.tags || []).map(t => <div key={t} className="bg-[#FAF7F2] border border-[#D5BDAF]/20 text-[#D5BDAF] px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-3">{t}<button onClick={() => removeItem('tags', t)} className="text-[#D5BDAF]/40 hover:text-red-500">×</button></div>)}</div>
                </div>
            </div>
          </section>

          {/* Segurança */}
          <section id="sec-security" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-10 scroll-mt-36 md:scroll-mt-32">
            <div className="flex justify-between items-center border-b border-gray-50 pb-6"><h2 className="text-xl font-serif flex items-center space-x-3"><ShieldCheck size={20} className="text-[#D5BDAF]" /><span>Acesso ADM</span></h2><button onClick={() => { setEditingUser({username: '', role: 'editor'}); setShowUserModal(true); }} className="text-[#D5BDAF] p-2 hover:bg-[#FAF7F2] rounded-full transition-colors"><UserPlus size={20} /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{(adminUsers || []).map(user => (
                <div key={user.id} className="p-4 bg-gray-50 rounded-3xl flex items-center justify-between group border border-transparent hover:border-[#D5BDAF]/20 transition-all">
                    <div><p className="text-xs font-bold uppercase tracking-widest text-gray-800">{user.username}</p><p className="text-[8px] text-gray-400 uppercase font-bold">{user.role}</p></div>
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingUser({id: user.id, username: user.username, role: user.role}); setShowUserModal(true); }} className="p-2 text-gray-300 hover:text-[#D5BDAF]"><Pencil size={14}/></button>
                       <button onClick={() => deleteAdminUser(user.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                </div>
            ))}</div>
          </section>
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl overflow-hidden">
            <h2 className="text-2xl font-serif text-center">{editingUser?.id ? 'Editar Admin' : 'Novo Admin'}</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Usuário</label>
                <input type="text" value={editingUser?.username || ''} onChange={e => setEditingUser(prev => prev ? {...prev, username: e.target.value} : null)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Senha</label>
                <input type="password" value={editingUser?.password || ''} onChange={e => setEditingUser(prev => prev ? {...prev, password: e.target.value} : null)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Cargo</label>
                <select value={editingUser?.role || 'editor'} onChange={e => setEditingUser(prev => prev ? {...prev, role: e.target.value as any} : null)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm appearance-none"><option value="editor">Editor</option><option value="superadmin">Super Admin</option></select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={handleSaveUser} className="w-full py-4 bg-[#212529] text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl transition-transform active:scale-95">Salvar Acesso</button>
               <button onClick={() => setShowUserModal(false)} className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Cancelar</button>
            </div>
        </div></div>
      )}
    </div>
  );
};

export default AdminSettings;
