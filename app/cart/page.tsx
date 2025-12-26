"use client";

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Trash2, Plus, Minus, Send, ShoppingBag, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

const Cart: React.FC = () => {
  const { cart, products, updateCartQuantity, removeFromCart, settings, recordEvent } = useStore();
  const [isLive, setIsLive] = useState(false);
  const [liveCode, setLiveCode] = useState('');

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product);

  const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const freeShippingProgress = Math.min((total / settings.freeShippingThreshold) * 100, 100);
  const missingForFreeShipping = Math.max(settings.freeShippingThreshold - total, 0);

  const handleCheckout = () => {
    recordEvent('checkout');
    const productList = cartItems.map(item => `${item.quantity}x ${item.product.name} (R$ ${item.product.price.toFixed(2)})`).join(', ');
    const totalPrice = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    let message = isLive ? settings.whatsappTemplateLive : settings.whatsappTemplateRegular;
    message = message.replace('{productList}', productList).replace('{totalPrice}', totalPrice).replace('{liveCode}', liveCode || 'N/A');
    
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="bg-[#FAF7F2] p-12 rounded-full mb-10 shadow-inner">
          <ShoppingBag size={56} className="text-[#D5BDAF]" strokeWidth={1} />
        </div>
        <h2 className="text-4xl font-serif mb-6 text-[#212529]">Sua sacola aguarda</h2>
        <Link href="/catalog" className="bg-[#212529] text-white px-14 py-5 rounded-full uppercase tracking-[0.3em] text-[11px] font-bold shadow-xl">Voltar às Coleções</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 animate-fade-in">
      <div className="flex items-center justify-between mb-16">
        <Link href="/catalog" className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400">
          <ArrowLeft size={14} /><span>Continuar Escolhendo</span>
        </Link>
        <h1 className="text-3xl font-serif text-center flex-grow">Minha Curadoria</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-7 space-y-10">
          <div className="bg-[#FAF7F2] p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold mb-5 flex justify-between">
              <span className={total >= settings.freeShippingThreshold ? 'text-green-600' : 'text-gray-800'}>
                {total >= settings.freeShippingThreshold ? '✨ Você garantiu Frete Grátis!' : `Faltam R$ ${missingForFreeShipping.toFixed(2)} para o Mimo`}
              </span>
            </p>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#D5BDAF] transition-all duration-1000" style={{ width: `${freeShippingProgress}%` }} />
            </div>
          </div>

          <div className="space-y-10">
            {cartItems.map(item => (
              <div key={item.productId} className="flex space-x-6 pb-10 border-b border-gray-100 last:border-0">
                <div className="w-28 h-36 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl text-gray-900">{item.product.name}</h3>
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-400 p-1"><Trash2 size={18} /></button>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-100">
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="p-2.5"><Minus size={14} /></button>
                      <span className="px-5 text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="p-2.5"><Plus size={14} /></button>
                    </div>
                    <p className="font-bold text-lg">R$ {(item.product.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-[#FAF7F2] p-10 rounded-3xl shadow-sm border border-gray-100 sticky top-32">
            <h3 className="text-[12px] uppercase tracking-[0.3em] font-bold mb-10 text-gray-400 border-b pb-4">Resumo do Pedido</h3>
            <div className="flex justify-between text-2xl font-serif mb-12">
               <span>Total Estimado</span>
               <span className="font-bold">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-[#25D366] text-white py-6 rounded-full uppercase tracking-[0.25em] font-bold text-xs hover:shadow-2xl transition-all flex items-center justify-center space-x-4 shadow-xl"
            >
              <Send size={18} /><span>Finalizar via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;