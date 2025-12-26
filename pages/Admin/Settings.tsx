
import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { 
  Save, Check, ImageIcon, Type, Trash2, ShieldCheck, 
  UserPlus, Radio, Plus, Eye, EyeOff, MessageSquare, 
  Tag as TagIcon, Layout, Image as ImageLucide, Link as LinkIcon, X, Lock, User, 
  Instagram, Facebook, Mail, Globe, Info, Truck, Pencil, Sparkles, ArrowLeft, Upload,
  Phone, MessageCircle, Code, HelpCircle, Quote, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { FAQItem, Testimonial } from '../../types';

const AdminSettings: React.FC = () => {
  const { settings, setSettings, adminUsers, deleteAdminUser, createAdminUser, updateAdminUser, showNotification } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newHotbarText, setNewHotbarText] = useState('');

  const [editingHotbarId, setEditingHotbarId] = useState<string | null>(null);
  const [tempHotbarText, setTempHotbarText] = useState('');

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{id?: string, username: string, password?: string, role: 'superadmin' | 'editor'} | null>(null);

  // FAQ and Testimonial States
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const testimonialImageRef = useRef<HTMLInputElement>(null);

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
        socialLinks: { ...prev.socialLinks, [field]: value }
    }));
  };

  const updateInstitutional = (field: string, value: string) => {
    setLocalSettings(prev => ({
        ...prev,
        institutional: { ...prev.institutional, [field]: value }
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

  const handleTestimonialImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditingTestimonial(prev => ({ ...prev, image: reader.result as string }));
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
    if (localSettings[field].includes(value)) {
      showNotification("Este item já existe.");
      return;
    }
    updateField(field, [...localSettings[field], value]);
    resetter('');
  };

  const removeItem = (field: 'categories' | 'tags', value: string) => {
    updateField(field, localSettings[field].filter(item => item !== value));
  };

  const addHotbarMessage = () => {
    if (!newHotbarText) return;
    const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        text: newHotbarText.toUpperCase(),
        enabled: true
    };
    updateField('hotbarMessages', [...localSettings.hotbarMessages, newMessage]);
    setNewHotbarText('');
  };

  const startEditingHotbar = (msg: {id: string, text: string}) => {
    setEditingHotbarId(msg.id);
    setTempHotbarText(msg.text);
  };

  const saveHotbarEdit = (id: string) => {
    updateField('hotbarMessages', localSettings.hotbarMessages.map(m => 
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

  const handleSaveFaq = () => {
    if (!editingFaq?.question || !editingFaq?.answer) return;
    const currentFaqs = localSettings.faqs || [];
    let nextFaqs;
    if (editingFaq.id) {
      nextFaqs = currentFaqs.map(f => f.id === editingFaq.id ? editingFaq as FAQItem : f);
    } else {
      nextFaqs = [...currentFaqs, { ...editingFaq, id: Math.random().toString(36).substr(2, 9), enabled: true } as FAQItem];
    }
    updateField('faqs', nextFaqs);
    setShowFaqModal(false);
    setEditingFaq(null);
  };

  const handleSaveTestimonial = () => {
    if (!editingTestimonial?.name || !editingTestimonial?.content) return;
    const currentTestimonials = localSettings.testimonials || [];
    let nextTestimonials;
    if (editingTestimonial.id) {
      nextTestimonials = currentTestimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial as Testimonial : t);
    } else {
      nextTestimonials = [...currentTestimonials, { ...editingTestimonial, id: Math.random().toString(36).substr(2, 9), enabled: true } as Testimonial];
    }
    updateField('testimonials', nextTestimonials);
    setShowTestimonialModal(false);
    setEditingTestimonial(null);
  };

  const menuItems = [
    { label: 'Logo', id: 'sec-logo' },
    { label: 'Banner', id: 'sec-banner' },
    { label: 'Checkout', id: 'sec-checkout' },
    { label: 'Redes Sociais', id: 'sec-social' },
    { label: 'Depoimentos', id: 'sec-testimonials' },
    { label: 'FAQ', id: 'sec-faq' },
    { label: 'Live Commerce', id: 'sec-live' },
    { label: 'Institucional', id: 'sec-inst' },
    { label: 'Hotbar', id: 'sec-hotbar' },
    { label: 'Taxonomia', id: 'sec-taxonomy' },
    { label: 'Segurança', id: 'sec-security' }
  ];

  return (
    <div className="max-w-5xl space-y-12 pb-24 animate-fade-in relative px-1 w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        {/* Navigation - Sidebar */}
        <div className="lg:col-span-1">
            <nav className="sticky top-20 md:top-32 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-2 lg:space-x-0 lg:space-y-1 bg-white p-4 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm scrollbar-hide">
                {menuItems.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => scrollToSection(item.id)}
                      className="whitespace-nowrap flex-shrink-0 text-left px-4 lg:px-6 py-3 lg:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black hover:bg-[#FAF7F2] transition-all border border-transparent"
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="lg:col-span-3 space-y-8 md:space-y-12">
          
          {/* Logo Section */}
          <section id="sec-logo" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><Layout size={20} className="text-[#D5BDAF]" /><span>Logo da Loja</span></h2>
            <div className="space-y-6">
                <div className="flex p-1.5 bg-gray-50 rounded-full w-full max-w-sm mx-auto md:mx-0">
                  <button onClick={() => updateField('logoType', 'text')} className={`flex-1 py-3 flex items-center justify-center space-x-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition ${localSettings.logoType === 'text' ? 'bg-white shadow-md text-black' : 'text-gray-400'}`}><Type size={14} /><span>Texto</span></button>
                  <button onClick={() => updateField('logoType', 'image')} className={`flex-1 py-3 flex items-center justify-center space-x-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition ${localSettings.logoType === 'image' ? 'bg-white shadow-md text-black' : 'text-gray-400'}`}><ImageIcon size={14} /><span>Imagem</span></button>
                </div>
                {localSettings.logoType === 'text' ? (
                   <input type="text" value={localSettings.logoText} onChange={(e) => updateField('logoText', e.target.value)} className="w-full px-6 md:px-8 py-4 rounded-full bg-gray-50 border outline-none text-sm focus:bg-white transition shadow-inner" placeholder="Ex: DETALHES"/>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <div className="w-32 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                       {localSettings.logoUrl ? <img src={localSettings.logoUrl} className="max-w-full max-h-full object-contain p-2" /> : <ImageIcon size={24} className="text-gray-200"/>}
                    </div>
                    <button onClick={() => logoInputRef.current?.click()} className="bg-[#212529] text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition flex items-center gap-3"><Upload size={14} /> Upar Logo</button>
                    <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logoUrl')} className="hidden" accept="image/*" />
                  </div>
                )}
            </div>
          </section>

          {/* Banner Section */}
          <section id="sec-banner" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><ImageLucide size={20} className="text-[#D5BDAF]" /><span>Banner Principal</span></h2>
            <div className="space-y-6">
                <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-100 shadow-inner group">
                    {localSettings.heroImageUrl ? (
                       <img src={localSettings.heroImageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageLucide size={48} strokeWidth={1} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => heroInputRef.current?.click()} className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl">Alterar Banner</button>
                    </div>
                    <input type="file" ref={heroInputRef} onChange={(e) => handleImageUpload(e, 'heroImageUrl')} className="hidden" accept="image/*" />
                </div>
                <input type="text" value={localSettings.headline} onChange={(e) => updateField('headline', e.target.value)} className="w-full px-8 py-4 rounded-full bg-gray-50 border outline-none text-sm focus:bg-white" placeholder="Headline"/>
                <textarea value={localSettings.subheadline} onChange={(e) => updateField('subheadline', e.target.value)} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-sm h-32 resize-none focus:bg-white shadow-inner" placeholder="Subheadline"/>
            </div>
          </section>

          {/* Checkout & WhatsApp */}
          <section id="sec-checkout" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><MessageCircle size={20} className="text-[#25D366]" /><span>Checkout & WhatsApp</span></h2>
            <div className="space-y-6">
                <input type="text" value={localSettings.whatsappNumber} onChange={(e) => updateField('whatsappNumber', e.target.value)} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm font-mono shadow-inner" placeholder="Número (Ex: 5511999999999)"/>
                <textarea value={localSettings.whatsappTemplateRegular} onChange={(e) => updateField('whatsappTemplateRegular', e.target.value)} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-xs h-32 resize-none leading-relaxed focus:bg-white transition shadow-inner font-mono" placeholder="Template Regular"/>
                <textarea value={localSettings.whatsappTemplateLive} onChange={(e) => updateField('whatsappTemplateLive', e.target.value)} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-xs h-32 resize-none leading-relaxed focus:bg-white transition shadow-inner font-mono" placeholder="Template Live"/>
            </div>
          </section>

          {/* Redes Sociais */}
          <section id="sec-social" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><Globe size={20} className="text-[#D5BDAF]" /><span>Redes Sociais</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" value={localSettings.socialLinks.instagram} onChange={(e) => updateSocial('instagram', e.target.value)} placeholder="Instagram URL" className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
                <input type="text" value={localSettings.socialLinks.facebook} onChange={(e) => updateSocial('facebook', e.target.value)} placeholder="Facebook URL" className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
                <input type="text" value={localSettings.socialLinks.tiktok} onChange={(e) => updateSocial('tiktok', e.target.value)} placeholder="TikTok URL" className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
                <input type="text" value={localSettings.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} placeholder="E-mail Contato" className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm"/>
            </div>
          </section>

          {/* Depoimentos Section */}
          <section id="sec-testimonials" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <div className="flex justify-between items-center border-b border-gray-50 pb-6">
              <h2 className="text-xl font-serif flex items-center space-x-3"><Quote size={20} className="text-[#D5BDAF]" /><span>Depoimentos</span></h2>
              <button onClick={() => { setEditingTestimonial({ rating: 5 }); setShowTestimonialModal(true); }} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><Plus size={18}/></button>
            </div>
            <div className="space-y-4">
              {localSettings.testimonials?.map(t => (
                <div key={t.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <img src={t.image || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" />
                    <div className="text-xs font-bold uppercase truncate max-w-[150px]">{t.name}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateField('testimonials', localSettings.testimonials.map(item => item.id === t.id ? {...item, enabled: !item.enabled} : item))} className="p-1 text-gray-400 hover:text-black">
                      {t.enabled ? <Eye size={14}/> : <EyeOff size={14}/>}
                    </button>
                    <button onClick={() => { setEditingTestimonial(t); setShowTestimonialModal(true); }} className="p-1 text-gray-400 hover:text-black"><Pencil size={14}/></button>
                    <button onClick={() => updateField('testimonials', localSettings.testimonials.filter(item => item.id !== t.id))} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section id="sec-faq" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <div className="flex justify-between items-center border-b border-gray-50 pb-6">
              <h2 className="text-xl font-serif flex items-center space-x-3"><HelpCircle size={20} className="text-[#D5BDAF]" /><span>FAQ</span></h2>
              <button onClick={() => { setEditingFaq({}); setShowFaqModal(true); }} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"><Plus size={18}/></button>
            </div>
            <div className="space-y-4">
              {localSettings.faqs?.map(f => (
                <div key={f.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group">
                  <div className="text-xs font-bold uppercase truncate max-w-[200px]">{f.question}</div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateField('faqs', localSettings.faqs.map(item => item.id === f.id ? {...item, enabled: !item.enabled} : item))} className="p-1 text-gray-400 hover:text-black">
                      {f.enabled ? <Eye size={14}/> : <EyeOff size={14}/>}
                    </button>
                    <button onClick={() => { setEditingFaq(f); setShowFaqModal(true); }} className="p-1 text-gray-400 hover:text-black"><Pencil size={14}/></button>
                    <button onClick={() => updateField('faqs', localSettings.faqs.filter(item => item.id !== f.id))} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Live Commerce */}
          <section id="sec-live" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm scroll-mt-24 md:scroll-mt-32">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif flex items-center space-x-3"><Radio size={20} className={localSettings.isLiveOn ? 'text-red-500' : 'text-gray-300'} /><span>Live Commerce Ativa?</span></h2>
                <button onClick={() => updateField('isLiveOn', !localSettings.isLiveOn)} className={`w-14 h-7 rounded-full relative transition-all ${localSettings.isLiveOn ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-gray-200'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${localSettings.isLiveOn ? 'right-1' : 'left-1'}`} /></button>
             </div>
          </section>

          {/* Institucional Section */}
          <section id="sec-inst" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <h2 className="text-xl font-serif flex items-center space-x-3 border-b border-gray-50 pb-6"><Info size={20} className="text-[#D5BDAF]" /><span>Políticas & Institucional</span></h2>
            <div className="space-y-8">
                {[
                  { key: 'about', label: 'Sobre a Marca' },
                  { key: 'shipping', label: 'Política de Envio' },
                  { key: 'returns', label: 'Trocas e Devoluções' },
                  { key: 'warranty', label: 'Garantia Premium' }
                ].map(item => (
                  <div key={item.key} className="space-y-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">{item.label}</label>
                    <textarea value={(localSettings.institutional as any)[item.key]} onChange={(e) => updateInstitutional(item.key, e.target.value)} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-xs h-32 md:h-40 resize-none leading-relaxed focus:bg-white transition shadow-inner"/>
                  </div>
                ))}
            </div>
          </section>

          {/* Hotbar */}
          <section id="sec-hotbar" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-8 scroll-mt-24 md:scroll-mt-32">
            <h2 className="text-xl font-serif border-b border-gray-50 pb-6 flex items-center space-x-3"><MessageSquare size={20} className="text-[#D5BDAF]" /><span>Hotbar de Avisos</span></h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <input type="text" value={newHotbarText} onChange={(e) => setNewHotbarText(e.target.value)} placeholder="Novo Aviso..." className="flex-grow px-8 py-4 rounded-full bg-gray-50 border outline-none text-xs uppercase focus:bg-white shadow-inner" />
                <button onClick={addHotbarMessage} className="bg-[#212529] text-white p-4 rounded-full flex justify-center items-center shadow-xl transition-transform active:scale-90"><Plus size={18} /></button>
            </div>
            <div className="space-y-3">
                {localSettings.hotbarMessages.map(msg => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-2xl flex flex-col sm:flex-row items-center justify-between group gap-4 border border-transparent hover:border-gray-100 transition-all">
                        {editingHotbarId === msg.id ? (
                           <div className="w-full flex items-center gap-3">
                              <input type="text" value={tempHotbarText} onChange={(e) => setTempHotbarText(e.target.value)} className="flex-grow bg-white px-4 py-2 rounded-full border border-[#D5BDAF] text-[10px] uppercase font-bold outline-none" autoFocus />
                              <button onClick={() => saveHotbarEdit(msg.id)} className="p-2 text-green-500 transition-transform active:scale-90"><Check size={14}/></button>
                              <button onClick={() => setEditingHotbarId(null)} className="p-2 text-red-400 transition-transform active:scale-90"><X size={14}/></button>
                           </div>
                        ) : (
                          <>
                            <span className={`text-[10px] font-bold uppercase tracking-widest text-center sm:text-left ${msg.enabled ? 'text-gray-800' : 'text-gray-400 italic line-through'}`}>{msg.text}</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setEditingHotbarId(msg.id); setTempHotbarText(msg.text); }} className="p-2 text-gray-400 hover:text-black transition-colors" title="Editar"><Pencil size={14}/></button>
                                <button onClick={() => updateField('hotbarMessages', localSettings.hotbarMessages.map(m => m.id === msg.id ? {...m, enabled: !m.enabled} : m))} className="p-2 text-gray-400 hover:text-[#D5BDAF] transition-colors">{msg.enabled ? <Eye size={14}/> : <EyeOff size={14}/>}</button>
                                <button onClick={() => updateField('hotbarMessages', localSettings.hotbarMessages.filter(m => m.id !== msg.id))} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                            </div>
                          </>
                        )}
                    </div>
                ))}
            </div>
          </section>

          {/* Taxonomy */}
          <section id="sec-taxonomy" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-12 scroll-mt-24 md:scroll-mt-32">
            <h2 className="text-xl font-serif border-b border-gray-50 pb-6 flex items-center space-x-3"><TagIcon size={20} className="text-[#D5BDAF]" /><span>Taxonomia</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-4">Categorias</label>
                    <div className="flex gap-2"><input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="flex-grow px-6 py-3 bg-gray-50 border rounded-full text-xs outline-none focus:bg-white" /><button onClick={() => addItem('categories', newCat, setNewCat)} className="bg-black text-white p-3 rounded-full"><Plus size={14}/></button></div>
                    <div className="flex flex-wrap gap-2">{localSettings.categories.map(c => <div key={c} className="bg-gray-100 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-3">{c}<button onClick={() => removeItem('categories', c)} className="text-gray-400 hover:text-red-500">×</button></div>)}</div>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-4">Tags</label>
                    <div className="flex gap-2"><input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="flex-grow px-6 py-3 bg-gray-50 border rounded-full text-xs outline-none focus:bg-white" /><button onClick={() => addItem('tags', newTag, setNewTag)} className="bg-black text-white p-3 rounded-full"><Plus size={14}/></button></div>
                    <div className="flex flex-wrap gap-2">{localSettings.tags.map(t => <div key={t} className="bg-[#FAF7F2] border border-[#D5BDAF]/20 text-[#D5BDAF] px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-3">{t}<button onClick={() => removeItem('tags', t)} className="text-[#D5BDAF]/40 hover:text-red-500">×</button></div>)}</div>
                </div>
            </div>
          </section>

          {/* Segurança */}
          <section id="sec-security" className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-10 scroll-mt-24 md:scroll-mt-32">
            <div className="flex justify-between items-center border-b border-gray-50 pb-6"><h2 className="text-xl font-serif flex items-center space-x-3"><ShieldCheck size={20} className="text-[#D5BDAF]" /><span>Segurança</span></h2><button onClick={() => { setEditingUser({username: '', role: 'editor'}); setShowUserModal(true); }} className="text-[#D5BDAF] p-2 hover:bg-[#FAF7F2] rounded-full transition-colors"><UserPlus size={20} /></button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{adminUsers.map(user => (
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

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowFaqModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24}/></button>
            <h2 className="text-xl font-serif text-center">{editingFaq?.id ? 'Editar FAQ' : 'Novo FAQ'}</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Pergunta</label>
                <input type="text" value={editingFaq?.question || ''} onChange={e => setEditingFaq({...editingFaq!, question: e.target.value})} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Resposta</label>
                <textarea value={editingFaq?.answer || ''} onChange={e => setEditingFaq({...editingFaq!, answer: e.target.value})} className="w-full px-6 py-4 rounded-[2rem] bg-gray-50 border outline-none text-sm h-32 resize-none" />
              </div>
            </div>
            <button onClick={handleSaveFaq} className="w-full py-4 bg-[#212529] text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">Salvar FAQ</button>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowTestimonialModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24}/></button>
            <h2 className="text-xl font-serif text-center">{editingTestimonial?.id ? 'Editar Depoimento' : 'Novo Depoimento'}</h2>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                   <img src={editingTestimonial?.image || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50" />
                   <button onClick={() => testimonialImageRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="text-white" size={20}/></button>
                </div>
                <input type="file" ref={testimonialImageRef} onChange={handleTestimonialImage} className="hidden" accept="image/*" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Nome</label>
                <input type="text" value={editingTestimonial?.name || ''} onChange={e => setEditingTestimonial({...editingTestimonial!, name: e.target.value})} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-4">Relato</label>
                <textarea value={editingTestimonial?.content || ''} onChange={e => setEditingTestimonial({...editingTestimonial!, content: e.target.value})} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50 border outline-none text-sm h-32 resize-none" />
              </div>
              <div className="flex items-center justify-between px-4">
                <span className="text-[10px] uppercase font-bold text-gray-400">Nota</span>
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(v => (
                     <button key={v} onClick={() => setEditingTestimonial({...editingTestimonial!, rating: v})} className={v <= (editingTestimonial?.rating || 0) ? 'text-[#D5BDAF]' : 'text-gray-200'}><Star size={20} fill="currentColor"/></button>
                   ))}
                </div>
              </div>
            </div>
            <button onClick={handleSaveTestimonial} className="w-full py-4 bg-[#212529] text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">Salvar Depoimento</button>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl overflow-hidden">
            <h2 className="text-2xl font-serif text-center">{editingUser?.id ? 'Editar Admin' : 'Novo Admin'}</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Usuário</label>
                <input type="text" value={editingUser?.username || ''} onChange={e => setEditingUser({...editingUser!, username: e.target.value})} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Senha</label>
                <input type="password" value={editingUser?.password || ''} onChange={e => setEditingUser({...editingUser!, password: e.target.value})} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-gray-400 ml-4 tracking-widest">Cargo</label>
                <select value={editingUser?.role || 'editor'} onChange={e => setEditingUser({...editingUser!, role: e.target.value as any})} className="w-full px-6 py-4 rounded-full bg-gray-50 border outline-none text-sm appearance-none"><option value="editor">Editor</option><option value="superadmin">Super Admin</option></select>
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
