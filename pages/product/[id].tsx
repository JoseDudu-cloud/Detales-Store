import React from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag } from 'lucide-react';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { products, addToCart } = useStore();
  
  const product = products.find(p => p.id === id);

  if (!product) return <div className="p-20 text-center">Peça não encontrada.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 shadow-sm">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-4">{product.category}</span>
        <h1 className="text-5xl font-serif mb-6">{product.name}</h1>
        <p className="text-3xl font-bold mb-8">R$ {product.price.toFixed(2)}</p>
        <p className="text-gray-600 mb-10 leading-relaxed italic">"{product.description}"</p>
        <button 
          onClick={() => addToCart(product.id)}
          className="bg-[#212529] text-white py-5 rounded-full uppercase tracking-widest font-bold text-xs shadow-xl flex items-center justify-center space-x-3"
        >
          <ShoppingBag size={18} />
          <span>Adicionar à Sacola</span>
        </button>
      </div>
    </div>
  );
}