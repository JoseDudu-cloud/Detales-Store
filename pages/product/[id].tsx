import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Star, Truck, Shield, Package, Sparkles } from 'lucide-react';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { products, addToCart } = useStore();
  const [activeImage, setActiveImage] = useState(0);

  const product = products.find(p => p.id === id);

  if (!product) return <div className="p-20 text-center font-serif text-xl">Carregando...</div>;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
        <div className="space-y-6">
          <div className="aspect-[3/4] overflow-hidden rounded-[2rem] bg-gray-50 shadow-sm relative border border-gray-100">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6">
              <span className="text-[9px] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-[0.2em] font-bold text-[#D5BDAF]">
                {product.tags[0]}
              </span>
            </div>
          </div>
          <div className="flex space-x-4">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`w-20 aspect-square rounded-xl overflow-hidden border-2 ${activeImage === i ? 'border-[#D5BDAF]' : 'border-transparent'}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-400">{product.category}</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-6 mt-2 leading-tight">{product.name}</h1>
          <div className="flex items-center space-x-2 mb-8">
            <div className="flex text-[#D5BDAF]">
              {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400">Excelente escolha</span>
          </div>
          <p className="text-3xl font-bold text-[#212529] mb-10">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="border-t border-b border-gray-100 py-10 mb-10">
            <p className="text-gray-600 italic font-serif text-lg leading-relaxed">"{product.description}"</p>
          </div>
          <button 
            onClick={() => { addToCart(product.id); router.push('/cart'); }}
            className="w-full bg-[#212529] text-white py-6 rounded-full uppercase tracking-[0.25em] font-bold text-xs hover:bg-black transition shadow-xl flex items-center justify-center space-x-3"
          >
            <ShoppingBag size={18} />
            <span>Adicionar à Sacola</span>
          </button>
        </div>
      </div>
    </div>
  );
}