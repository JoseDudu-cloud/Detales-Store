
import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, Truck, ShieldCheck, Gift, Sparkles, ShoppingBag, Clock } from 'lucide-react';
import { Product } from '@/types';

export default function Home() {
  const { settings, products, addToCart } = useStore();

  const bestSellers = products.filter(p => p.tags.includes('Mais Vendido')).slice(0, 4);
  const newArrivals = products.filter(p => p.tags.includes('Novidade')).slice(0, 4);

  return (
    <div className="animate-fade-in bg-[#FDFBF9]">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <img 
          src={settings.heroImageUrl} 
          alt="Banner" 
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
          <p className="text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto tracking-wide">{settings.subheadline}</p>
          <Link href="/catalog" className="bg-white text-[#212529] px-12 py-4 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-[#212529] hover:text-white transition-all shadow-xl">
            Ver Coleção
          </Link>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="py-16 bg-white border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] p-5 rounded-full w-fit mx-auto"><Truck className="text-[#D5BDAF]" size={28} /></div>
            <span className="uppercase tracking-widest text-[10px] font-bold">Envio Express</span>
          </div>
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] p-5 rounded-full w-fit mx-auto"><Gift className="text-[#D5BDAF]" size={28} /></div>
            <span className="uppercase tracking-widest text-[10px] font-bold">Mimo na Caixinha</span>
          </div>
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] p-5 rounded-full w-fit mx-auto"><ShieldCheck className="text-[#D5BDAF]" size={28} /></div>
            <span className="uppercase tracking-widest text-[10px] font-bold">Garantia Premium</span>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center md:text-left mb-16">
          <span className="text-[#D5BDAF] text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">Os Mais Desejados</span>
          <h2 className="text-4xl font-serif">Favoritos Detalhes</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} onAdd={() => addToCart(product.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product, onAdd: () => void }) {
  return (
    <div className="group block relative">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6 rounded-3xl border border-gray-100">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {product.tags.map((tag, i) => (
              <span key={i} className="text-[8px] uppercase tracking-widest font-bold px-3 py-1 bg-white rounded-full shadow-sm">{tag}</span>
            ))}
          </div>
        </div>
      </Link>
      <div className="text-center">
        <h3 className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">{product.name}</h3>
        <p className="font-bold font-serif">R$ {product.price.toFixed(2)}</p>
        <button onClick={onAdd} className="mt-4 bg-gray-50 p-3 rounded-full hover:bg-[#D5BDAF] hover:text-white transition">
          <ShoppingBag size={16} />
        </button>
      </div>
    </div>
  );
}
