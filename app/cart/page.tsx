
"use client";

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Trash2, Send, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';

export default function Cart() {
  const { cart, products, removeFromCart, settings } = useStore();

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(item => item.product);

  const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    const productList = cartItems.map(item => `${item.quantity}x ${item.product.name}`).join(', ');
    const msg = settings.whatsappTemplateRegular.replace('{productList}', productList).replace('{totalPrice}', `R$ ${total.toFixed(2)}`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-serif mb-12 text-center">Sua Sacola</h1>
        
        {cartItems.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
            <ShoppingBag size={56} className="text-[#D5BDAF] mb-6" />
            <h2 className="text-2xl font-serif mb-6">Sua sacola está vazia</h2>
            <Link href="/catalog" className="bg-[#212529] text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest">Descobrir Peças</Link>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {cartItems.map(item => (
                <div key={item.productId} className="flex items-center space-x-6 pb-6 border-b border-gray-50">
                  <img src={item.product.images[0]} className="w-20 h-24 object-cover rounded-xl" alt="" />
                  <div className="flex-grow">
                    <h3 className="font-serif text-lg">{item.product.name}</h3>
                    <p className="text-sm font-bold">R$ {item.product.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-12 p-8 bg-[#FAF7F2] rounded-3xl text-center">
              <p className="text-2xl font-serif mb-8">Total: R$ {total.toFixed(2)}</p>
              <button onClick={handleCheckout} className="bg-[#25D366] text-white px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl flex items-center justify-center mx-auto space-x-3 hover:scale-105 transition-transform">
                <Send size={18} />
                <span>Finalizar via WhatsApp</span>
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
