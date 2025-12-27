
import React, { useState, useEffect } from 'react';
// Use namespace import and any-casting to bypass 'no exported member' errors
import * as ReactRouterDOM from 'react-router-dom';
import { useStore } from '../store';
import { 
  ArrowRight, Star, Truck, ShieldCheck, Heart, Clock, 
  Sparkles, ShoppingBag, Image as ImageLucide, MessageCircle, ChevronDown, Plus, Minus, Instagram
} from 'lucide-react';
import { Product, InstagramPost } from '../types';

const { Link, useNavigate } = ReactRouterDOM as any;

const Home: React.FC = () => {
  const { settings, products } = useStore();
  const [apiPosts, setApiPosts] = useState<InstagramPost[]>([]);
  const [loadingInstagram, setLoadingInstagram] = useState(false);

  const bestSellers = products.filter(p => p.tags.includes('Mais Vendido')).slice(0, 4);
  const newArrivals = products.filter(p => p.tags.includes('Novidade')).slice(0, 4);
  const activeTestimonials = settings?.testimonials?.filter(t => t.enabled) || [];
  const activeFaqs = settings?.faqs?.filter(f => f.enabled) || [];
  
  // Defensive initialization for instagramSection
  const instagram = settings?.instagramSection || { 
    enabled: false, 
    useApi: false, 
    posts: [], 
    title: 'Siga-nos', 
    username: '', 
    profileUrl: '#', 
    buttonText: 'Instagram' 
  };

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
          src={settings?.heroImageUrl || ''} 
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
            {settings?.headline || ''}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 font-light max-w-2xl mx-auto tracking-wide italic">
            {settings?.subheadline || ''}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/catalog" 
              className="bg-white text-[#212529] px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-[#212529] hover:text-white transition-all duration-500 w-full sm:w-auto text-center shadow-xl"
            >
              Ver Coleção
            </Link>
            <Link 
              to="/catalog?cat=Kits & Presentes" 
              className="bg-transparent text-white px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold border border-white/50 hover:bg-white/10 transition-all duration-300 w-full sm:w-auto text-center backdrop-blur-sm"
            >
              Presentes
            </Link>
          </div>
        </div>
      </section>

      {/* Conversion Banner: Live Urgency (Y) - ONLY IF LIVE IS ON */}
      {settings?.isLiveOn && (
        <section className="bg-red-600 text-white py-4 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-8 animate-pulse">
             <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] font-bold">
               <div className="w-2 h-2 bg-white rounded-full"></div>
               <span>Descontos exclusivos da LIVE ativados</span>
             </div>
             <span className="hidden md:inline text-white/40">|</span>
             <div className="hidden md:flex items-center space-x-3">
               <Clock size={14} className="text-white" />
               <span className="text-[10px] uppercase tracking-[0.3em] font-medium">Preços válidos enquanto durar a transmissão</span>
             </div>
          </div>
        </section>
      )}

      {/* Premium Value Propositions Section */}
      <section className="py-20 bg-[#FAF9F6] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Column 1: Qualidade */}
            <div className="flex flex-col items-center text-center px-6 py-12 md:px-8 md:border-r border-gray-100 last:border-r-0 last:border-b-0 border-b md:border-b-0 group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-50 group-hover:scale-110 group-hover:bg-[#D5BDAF] transition-all duration-500">
                <ShieldCheck className="text-[#D5BDAF] group-hover:text-white transition-colors" size={28} strokeWidth={1.2} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-gray-900 font-medium">Qualidade Premium</h3>
              <p className="text-gray-400 text-[10px] leading-relaxed uppercase tracking-[0.2em] max-w-[240px] font-semibold">
                Banhado a ouro 18k e prata 925, com verniz de proteção antialérgico.
              </p>
            </div>
            
            {/* Column 2: Curadoria */}
            <div className="flex flex-col items-center text-center px-6 py-12 md:px-8 md:border-r border-gray-100 last:border-r-0 last:border-b-0 border-b md:border-b-0 group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-50 group-hover:scale-110 group-hover:bg-[#D5BDAF] transition-all duration-500">
                <Heart className="text-[#D5BDAF] group-hover:text-white transition-colors" size={28} strokeWidth={1.2} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-gray-900 font-medium">Curadoria Feminina</h3>
              <p className="text-gray-400 text-[10px] leading-relaxed uppercase tracking-[0.2em] max-w-[240px] font-semibold">
                Peças pensadas por mulheres para mulheres, unindo tendência e atemporalidade.
              </p>
            </div>
            
            {/* Column 3: Atendimento */}
            <div className="flex flex-col items-center text-center px-6 py-12 md:px-8 last:border-r-0 last:border-b-0 group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-50 group-hover:scale-110 group-hover:bg-[#D5BDAF] transition-all duration-500">
                <Sparkles className="text-[#D5BDAF] group-hover:text-white transition-colors" size={28} strokeWidth={1.2} />
              </div>
              <h3 className="font-serif text-2xl mb-3 text-gray-900 font-medium">Atendimento Pessoal</h3>
              <p className="text-gray-400 text-[10px] leading-relaxed uppercase tracking-[0.2em] max-w-[240px] font-semibold">
                Suporte dedicado no WhatsApp para te ajudar a escolher a peça perfeita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            <span className="text-[#D5BDAF] text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">Os Mais Desejados</span>
            <h2 className="text-5xl font-serif font-medium">Favoritos Detalhes</h2>
          </div>
          <Link to="/catalog" className="text-[11px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-[#D5BDAF] hover:border-[#D5BDAF] transition-all">
            Ver tudo
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Emotional Banner (X) */}
      <section className="py-24 bg-[#FAF7F2] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 md:gap-24">
          <div className="w-full md:w-5/12 relative">
             <img 
               src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&h=1000&q=80" 
               alt="Woman wearing jewelry detail" 
               className="rounded-3xl shadow-2xl relative z-10"
             />
             <div className="absolute -top-10 -left-10 w-40 h-40 border-[20px] border-[#D5BDAF]/20 rounded-full z-0"></div>
          </div>
          <div className="w-full md:w-7/12 space-y-10">
            <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.3em]">Beleza & Confiança</span>
            <h2 className="text-5xl md:text-6xl font-serif leading-tight text-gray-900 font-medium">Peças que contam a sua história.</h2>
            <p className="text-gray-500 leading-relaxed text-lg font-light italic">
              Cada semijoia Detalhes é selecionada para proporcionar mais que um acessório: um momento de autocuidado e elegância.
            </p>
            <Link 
              to="/catalog" 
              className="inline-flex items-center space-x-4 bg-[#212529] text-white px-10 py-5 rounded-full font-bold uppercase tracking-[0.25em] text-[11px] hover:bg-black transition-all shadow-xl"
            >
              <span>Descubra sua próxima peça</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.4em]">Novidades</span>
          <h2 className="text-5xl font-serif font-medium">Sua dose semanal de brilho</h2>
          <div className="w-12 h-[1px] bg-[#D5BDAF] mx-auto mt-6"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      {activeTestimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.4em]">Depoimentos</span>
              <h2 className="text-4xl md:text-5xl font-serif mt-4 font-medium">O que elas dizem sobre nossos detalhes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeTestimonials.map(t => (
                <div key={t.id} className="bg-[#FDFBF9] p-10 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center text-center">
                  <div className="flex text-[#D5BDAF] mb-6">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-600 font-serif italic text-xl leading-relaxed mb-8">"{t.text}"</p>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-900">— {t.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Showcase Section */}
      {instagram?.enabled && (instagram?.posts?.length > 0 || apiPosts.length > 0) && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.4em] block mb-4">Comunidade</span>
              <h2 className="text-4xl md:text-5xl font-serif mb-4 font-medium">{instagram.title}</h2>
              <a 
                href={instagram.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors"
              >
                {instagram.username}
              </a>
            </div>
            
            {loadingInstagram ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#D5BDAF] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
                {displayPosts.map((post) => (
                  <a 
                    key={post.id} 
                    href={post.permalink || instagram.profileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group relative aspect-square overflow-hidden rounded-[2rem] shadow-sm"
                  >
                    <img 
                      src={post.imageUrl} 
                      alt="Instagram Post" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Instagram size={24} className="text-white" />
                    </div>
                  </a>
                ))}
              </div>
            )}

            <div className="flex justify-center">
              <a 
                href={instagram.profileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-black text-white px-12 py-5 rounded-full uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#D5BDAF] transition-all shadow-xl"
              >
                {instagram.buttonText}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {activeFaqs.length > 0 && (
        <section className="py-24 bg-[#FAF9F6]">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.4em]">Suporte</span>
              <h2 className="text-4xl md:text-5xl font-serif mt-4 font-medium">Dúvidas Frequentes</h2>
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
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-serif font-semibold text-gray-900 tracking-wide">{item.question}</span>
        {isOpen ? <Minus size={16} className="text-[#D5BDAF]" /> : <Plus size={16} className="text-[#D5BDAF]" />}
      </button>
      {isOpen && (
        <div className="px-8 pb-8 animate-fade-in">
          <p className="text-gray-500 text-sm leading-relaxed tracking-wide font-light">{item.answer}</p>
        </div>
      )}
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

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div className="group block relative cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6 rounded-3xl border border-gray-100 shadow-sm">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageLucide size={40} strokeWidth={1} />
          </div>
        )}
        
        {/* Tags */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none z-10">
          {(product.tags || []).map((tag: any, i: number) => (
            <span key={i} className={`text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full shadow-lg ${
              tag === 'Novidade' ? 'bg-white text-black' : 
              tag === 'Oferta da Live' ? 'bg-red-500 text-white' : 
              'bg-[#D5BDAF] text-white'
            }`}>
              {tag}
            </span>
          ))}
        </div>
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 flex items-center justify-center z-20">
            <button 
                onClick={handleQuickAdd}
                className="bg-white text-[#212529] p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#212529] hover:text-white transform scale-90 group-hover:scale-100"
                title="Adicionar à sacola"
            >
                <ShoppingBag size={20} strokeWidth={1.5} />
            </button>
        </div>
      </div>
      <div className="text-center px-2">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-gray-400 mb-1 group-hover:text-black transition-colors">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-gray-900 tracking-wider font-serif">
          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default Home;
