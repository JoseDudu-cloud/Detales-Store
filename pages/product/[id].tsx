
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, ShoppingBag, Shield, Truck, Package, Heart, Star, Sparkles, Image as ImageLucide } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { products, addToCart, recordEvent } = useStore();
  const [activeImage, setActiveImage] = useState(0);

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (product) {
      recordEvent('view', product.id);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product) return <div className="p-20 text-center font-serif text-xl">Buscando detalhes da joia...</div>;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-6 py-12 md:py-20">
      <nav className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-12">
        <Link href="/" className="hover:text-black">Início</Link>
        <ChevronRight size={10} />
        <Link href="/catalog" className="hover:text-black">Catálogo</Link>
        <ChevronRight size={10} />
        <span className="text-black font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
        <div className="space-y-6">
          <div className="aspect-[3/4] overflow-hidden rounded-[2rem] bg-gray-50 shadow-sm relative border border-gray-100">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 flex flex-col space-y-2">
              {product.tags.map((tag, i) => (
                <span key={i} className="text-[9px] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-[0.2em] font-bold text-[#D5BDAF] shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {product.images.length > 1 && (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-24 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-[#D5BDAF] scale-105' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col pt-4">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">{product.category}</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">{product.name}</h1>
          
          <div className="mb-10">
            <p className="text-3xl font-bold text-[#212529] mb-2 tracking-tight">R$ {product.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest border-l-2 border-[#D5BDAF] pl-4 italic">
              Joia banhada a Ouro 18k com Verniz Diamond
            </p>
          </div>

          <div className="border-y border-gray-100 py-8 mb-10">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 text-gray-400">Descrição</h3>
            <p className="text-gray-600 leading-relaxed text-lg font-light italic font-serif">"{product.description}"</p>
          </div>

          <button 
            onClick={() => addToCart(product.id)}
            className="w-full bg-[#212529] text-white py-6 rounded-full uppercase tracking-[0.25em] font-bold text-xs hover:bg-black shadow-xl flex items-center justify-center space-x-3 transition-all"
          >
            <ShoppingBag size={18} />
            <span>Adicionar à Sacola</span>
          </button>

          <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-gray-100">
            <div className="text-center space-y-2">
              <Truck size={20} className="text-[#D5BDAF] mx-auto" />
              <p className="text-[8px] uppercase font-bold tracking-widest">Envio Imediato</p>
            </div>
            <div className="text-center space-y-2">
              <Shield size={20} className="text-[#D5BDAF] mx-auto" />
              <p className="text-[8px] uppercase font-bold tracking-widest">1 Ano Garantia</p>
            </div>
            <div className="text-center space-y-2">
              <Package size={20} className="text-[#D5BDAF] mx-auto" />
              <p className="text-[8px] uppercase font-bold tracking-widest">Gift Box</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
