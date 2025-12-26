"use client";

import React from 'react';
import Link from 'next/link';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Star, Truck, ShieldCheck, Gift, Clock, Sparkles, ShoppingBag, Image as ImageLucide } from 'lucide-react';
import { Product } from '../types';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
  const { settings, products } = useStore();

  const bestSellers = products.filter(p => p.tags.includes('Mais Vendido')).slice(0, 4);
  const newArrivals = products.filter(p => p.tags.includes('Novidade')).slice(0, 4);

  return (
    <div className="animate-fade-in bg-[#FDFBF9]">
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img 
          src={settings.heroImageUrl} 
          alt="Premium Jewelry" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl text-white">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold">
              <Sparkles size={12} />
              <span>{settings.isLiveOn ? 'OFERTAS DA LIVE' : 'Coleção Exclusiva'}</span>
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-serif mb-6 leading-tight drop-shadow-lg">{settings.headline}</h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 font-light max-w-2xl mx-auto tracking-wide">{settings.subheadline}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/catalog" className="bg-white text-[#212529] px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-[#212529] hover:text-white transition-all w-full sm:w-auto text-center shadow-xl">Ver Coleção</Link>
            <Link href="/gifts" className="bg-transparent text-white px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold border border-white/50 hover:bg-white/10 transition-all w-full sm:w-auto text-center backdrop-blur-sm">Presentes</Link>
          </div>
        </div>
      </section>

      {settings.isLiveOn && (
        <section className="bg-red-600 text-white py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-8 animate-pulse">
             <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.3em] font-bold">
               <div className="w-2 h-2 bg-white rounded-full"></div>
               <span>Descontos exclusivos da LIVE ativados</span>
             </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {settings.trustIcons.filter(t => t.enabled).map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="bg-[#FAF7F2] p-5 rounded-full mb-6 group-hover:bg-[#D5BDAF] transition-colors">
                {item.icon === 'Shipping' && <Truck className="text-[#D5BDAF] group-hover:text-white" size={28} strokeWidth={1.5} />}
                {item.icon === 'Gift' && <Gift className="text-[#D5BDAF] group-hover:text-white" size={28} strokeWidth={1.5} />}
                {item.icon === 'Shield' && <ShieldCheck className="text-[#D5BDAF] group-hover:text-white" size={28} strokeWidth={1.5} />}
              </div>
              <span className="uppercase tracking-[0.25em] text-[10px] font-bold text-gray-800">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl font-serif">Favoritos Detalhes</h2>
          <Link href="/catalog" className="text-[11px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-[#D5BDAF] hover:border-[#D5BDAF] transition-all">Ver tudo</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {bestSellers.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="py-24 bg-[#FAF7F2] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-5/12">
             <img src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&h=1000&q=80" alt="Detail" className="rounded-3xl shadow-2xl" />
          </div>
          <div className="w-full md:w-7/12 space-y-10">
            <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.3em]">Beleza & Confiança</span>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight">Peças que contam a sua história.</h2>
            <Link href="/catalog" className="inline-flex items-center space-x-4 bg-[#212529] text-white px-10 py-5 rounded-full font-bold uppercase tracking-[0.25em] text-[11px] hover:bg-black transition-all shadow-xl">
              <span>Descubra sua próxima peça</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <span className="text-[#D5BDAF] text-[11px] font-bold uppercase tracking-[0.4em]">Novidades</span>
          <h2 className="text-4xl font-serif">Sua dose semanal de brilho</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {newArrivals.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
};

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useStore();
  const router = useRouter();

  return (
    <div className="group block relative cursor-pointer" onClick={() => router.push(`/product/${product.id}`)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6 rounded-3xl border border-gray-100 shadow-sm">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
          {product.tags.map((tag, i) => (
            <span key={i} className={`text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 rounded-full shadow-lg ${tag === 'Novidade' ? 'bg-white text-black' : 'bg-[#D5BDAF] text-white'}`}>
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center z-20">
            <button 
                onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                className="bg-white text-[#212529] p-4 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all hover:bg-[#212529] hover:text-white"
            >
                <ShoppingBag size={20} strokeWidth={1.5} />
            </button>
        </div>
      </div>
      <div className="text-center px-2">
        <h3 className="text-[12px] uppercase tracking-[0.15em] font-medium text-gray-500 mb-1 group-hover:text-black">{product.name}</h3>
        <p className="text-sm font-bold text-gray-900 tracking-wider font-serif">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>
    </div>
  );
};

export default Home;