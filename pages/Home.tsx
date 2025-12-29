
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useStore } from '../store';
import { 
  ArrowRight, Star, Truck, ShieldCheck, Heart, Clock, 
  Sparkles, ShoppingBag, Image as ImageLucide, MessageCircle, ChevronDown, Plus, Minus, Instagram, ChevronLeft, CheckCircle2
} from 'lucide-react';
import { Product, InstagramPost } from '../types';
import { INITIAL_SETTINGS } from '../constants';

const { Link, useNavigate } = ReactRouterDOM as any;

const Home: React.FC = () => {
  const { settings, products } = useStore();
  const [apiPosts, setApiPosts] = useState<InstagramPost[]>([]);
  const [loadingInstagram, setLoadingInstagram] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const bestSellers = products.filter(p => p.tags?.includes('Mais Vendido')).slice(0, 4);
  const newArrivals = products.filter(p => p.tags?.includes('Novidade')).slice(0, 4);
  const activeTestimonials = settings?.testimonials?.filter(t => t.enabled) || [];
  const activeFaqs = settings?.faqs?.filter(f => f.enabled) || [];
  
  const instagram = settings?.instagramSection ?? INITIAL_SETTINGS.instagramSection;

  useEffect(() => {
    if (activeTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % activeTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTestimonials.length]);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      if (!instagram?.enabled || !instagram?.useApi || !instagram?.accessToken || !instagram?.userId) return;
      
      setLoadingInstagram(true);
      try {
        const url = `https://graph.instagram.com/${instagram.userId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${instagram.accessToken}`;
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.data) {
          const filtered = json.data
            .filter((post: any) => post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM')
            .slice(0, instagram.fetchCount || 8)
            .map((post: any) => ({
              id: post.id,
              imageUrl: post.media_url,
              permalink: post.permalink
            }));
          setApiPosts(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch Instagram API posts:", error);
      } finally {
        setLoadingInstagram(false);
      }
    };

    fetchInstagramFeed();
  }, [instagram?.enabled, instagram?.useApi, instagram?.accessToken, instagram?.userId, instagram?.fetchCount]);

  const displayPosts = (instagram?.useApi && apiPosts.length > 0) ? apiPosts : (instagram?.posts || []);

  return (
    <div className="animate-fade-in bg-[#FDFBF9]">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img 
          src={settings?.heroImageUrl || INITIAL_SETTINGS.heroImageUrl} 
          alt="Premium Jewelry Lifestyle" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85] transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl text-white">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold">
              <Sparkles size={12} />
              <span>{settings?.isLiveOn ? 'OFERTAS DA LIVE' : 'Coleção Exclusiva'}</span>
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif mb-6 leading-tight drop-shadow-lg font-medium">
            {settings?.headline || INITIAL_SETTINGS.headline}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 font-light max-w-2xl mx-auto tracking-wide italic">
            {settings?.subheadline || INITIAL_SETTINGS.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/catalog" className="bg-white text-[#212529] px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-[#212529] hover:text-white transition-all duration-500 w-full sm:w-auto text-center shadow-xl">Ver Coleção</Link>
            <Link to="/catalog?cat=Kits & Presentes" className="bg-transparent text-white px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold border border-white/50 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto text-center backdrop-blur-sm">Presentes</Link>
          </div>
        </div>
      </section>

      {/* Live Badge */}
      {settings?.isLiveOn && (
        <section className="bg-red-600 text-white py-4 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-8 animate-pulse">
             <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] font-bold">
               <div className="w-2 h-2 bg-white rounded-full"></div>
               <span>Descontos exclusivos da LIVE ativados</span>
             </div>
             <div className="hidden md:flex items-center space-x-3">
               <Clock size={14} className="text-white" />
               <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Preços válidos enquanto durar a transmissão</span>
             </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-20 bg-[#FAF9F6] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="flex flex-col items-center text-center px-6 py-12 group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-50 group-hover:scale-110 group-hover:bg-[#D5BDAF] transition-all duration-500">
                <ShieldCheck className="text-[#D5BDAF] group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-gray-900 font-medium">Qualidade Premium</h3>
              <p className="text-gray-400 text-[10px] leading-relaxed uppercase tracking-[0.2em] font-semibold">Banhado a ouro 18k e prata 925.</p>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-12 group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-50 group-hover:scale-110 group-hover:bg-[#D5BDAF] transition-all duration-500">
                <Heart className="text-[#D5BDAF] group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-gray-900 font-medium">Curadoria Feminina</h3>
              <p className="text-gray-400 text-[10px] leading-relaxed uppercase tracking-[0.2em] font-semibold">Peças pensadas para mulheres modernas.</p>
            </div>
            <div className="flex flex-col items-center text-center px-6 py-12 group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-50 group-hover:scale-110 group-hover:bg-[#D5BDAF] transition-all duration-500">
                <Sparkles className="text-[#D5BDAF] group-hover:text-white transition-colors" size={28} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-gray-900 font-medium">Atendimento Pessoal</h3>
              <p className="text-gray-400 text-[10px] leading-relaxed uppercase tracking-[0.2em] font-semibold">Suporte via WhatsApp 1:1.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF SECTION: WHAT THEY SAY */}
      {activeTestimonials.length > 0 && (
        <section className="py-32 bg-white overflow-hidden border-b border-gray-50">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="mb-20 space-y-4">
              <span className="text-[#D5BDAF] text-[10px] font-bold uppercase tracking-[0.5em] block">Loved by Women Like You</span>
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#212529]">O que elas dizem sobre nossos detalhes</h2>
              <div className="w-12 h-px bg-[#D5BDAF] mx-auto mt-6"></div>
            </div>

            <div className="relative min-h-[300px] flex items-center justify-center">
               {activeTestimonials.map((testimonial, index) => (
                 <div 
                   key={testimonial.id}
                   className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${index === activeTestimonial ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                 >
                   <div className="flex items-center justify-center space-x-1 mb-8">
                     {[...Array(5)].map((_, i) => (
                       <Star 
                         key={i} 
                         size={20} 
                         className={i < testimonial.rating ? 'text-[#D5BDAF] fill-[#D5BDAF]' : 'text-gray-200'} 
                         strokeWidth={1}
                       />
                     ))}
                   </div>
                   
                   <blockquote className="text-2xl md:text-3xl font-serif font-light text-gray-800 leading-relaxed italic mb-10 max-w-3xl">
                     "{testimonial.text}"
                   </blockquote>

                   <div className="flex flex-col items-center space-y-3">
                     <cite className="not-italic text-[12px] font-bold uppercase tracking-[0.3em] text-[#212529]">
                       {testimonial.name}
                     </cite>
                     {testimonial.isVerified && (
                        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                          <CheckCircle2 size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">Verified Buyer</span>
                        </div>
                     )}
                   </div>
                 </div>
               ))}
            </div>

            <div className="flex justify-center items-center space-x-12 mt-16">
               <button 
                 onClick={() => setActiveTestimonial(prev => (prev - 1 + activeTestimonials.length) % activeTestimonials.length)}
                 className="p-3 text-gray-300 hover:text-black transition-colors"
                 aria-label="Anterior"
               >
                 <ChevronLeft size={32} strokeWidth={1} />
               </button>
               
               <div className="flex space-x-4">
                 {activeTestimonials.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${idx === activeTestimonial ? 'w-12 bg-[#D5BDAF]' : 'w-2 bg-gray-100 hover:bg-gray-200'}`}
                    />
                 ))}
               </div>

               <button 
                 onClick={() => setActiveTestimonial(prev => (prev + 1) % activeTestimonials.length)}
                 className="p-3 text-gray-300 hover:text-black transition-colors"
                 aria-label="Próximo"
               >
                 <ArrowRight size={32} strokeWidth={1} />
               </button>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 text-center md:text-left">
          <div>
            <span className="text-[#D5BDAF] text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">Os Mais Desejados</span>
            <h2 className="text-5xl font-serif font-medium">Favoritos Detalhes</h2>
          </div>
          <Link to="/catalog" className="text-[11px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-[#D5BDAF] hover:border-[#D5BDAF] transition-all">Ver tudo</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.4em]">Novidades</span>
          <h2 className="text-5xl font-serif font-medium">Sua dose semanal de brilho</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Instagram */}
      {instagram?.enabled && (displayPosts.length > 0) && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.4em] block mb-4">Comunidade</span>
              <h2 className="text-4xl md:text-5xl font-serif mb-4 font-medium">{instagram.title}</h2>
              <a href={instagram.profileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors">{instagram.username}</a>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
              {displayPosts.map((post) => (
                <a key={post.id} href={post.permalink || instagram.profileUrl} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-[2rem] shadow-sm">
                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Instagram size={24} className="text-white" /></div>
                </a>
              ))}
            </div>
            <div className="flex justify-center">
              <a href={instagram.profileUrl} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-12 py-5 rounded-full uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#D5BDAF] transition-all shadow-xl">{instagram.buttonText}</a>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {activeFaqs.length > 0 && (
        <section className="py-24 bg-[#FAF9F6]">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-medium">Dúvidas Frequentes</h2>
            </div>
            <div className="space-y-4">
              {activeFaqs.map(f => (
                <FAQItemComponent key={f.id} item={f} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const FAQItemComponent: React.FC<{ item: any }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-8 py-6 flex items-center justify-between text-left">
        <span className="text-lg font-serif font-semibold text-gray-900">{item.question}</span>
        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
      </button>
      {isOpen && <div className="px-8 pb-8 animate-fade-in"><p className="text-gray-500 text-sm">{item.answer}</p></div>}
    </div>
  );
};

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useStore();
  const navigate = useNavigate();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const mainImage = product.images?.[0] || null;

  return (
    <div className="group block relative cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6 rounded-3xl border border-gray-100 shadow-sm">
        {mainImage ? <img src={mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageLucide size={40} /></div>}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none">
          {product.tags?.map((tag: any, i: number) => (
            <span key={i} className={`text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full shadow-lg ${tag === 'Novidade' ? 'bg-white text-black' : 'bg-[#D5BDAF] text-white'}`}>{tag}</span>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 flex items-center justify-center">
            <button onClick={handleQuickAdd} className="bg-white text-[#212529] p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#212529] hover:text-white"><ShoppingBag size={20} /></button>
        </div>
      </div>
      <div className="text-center px-2">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-1">{product.name}</h3>
        <p className="text-lg font-bold text-gray-900 tracking-wider font-serif">R$ {product.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default Home;
