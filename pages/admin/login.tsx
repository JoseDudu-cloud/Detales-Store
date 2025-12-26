
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/context/StoreContext';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const { login, showNotification } = useStore();
  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(u, p);
    if (success) {
      router.push('/admin');
    } else {
      showNotification("Credenciais inválidas! ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
      <div className="w-full max-w-md relative">
        <Link href="/" className="absolute -top-12 left-0 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-black transition">
          <ArrowLeft size={14} /> Voltar à Loja
        </Link>
        <form onSubmit={handle} className="bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-gray-100">
          <div className="inline-block p-5 bg-[#FAF7F2] rounded-full mb-8 text-[#D5BDAF]">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2 uppercase tracking-widest">Acesso ADM</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-10">Painel de Controle</p>
          
          <div className="space-y-4 mb-8">
            <input 
              type="text" 
              placeholder="Usuário" 
              className="w-full px-8 py-5 rounded-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#D5BDAF]/20 outline-none transition" 
              onChange={e => setU(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Senha" 
              className="w-full px-8 py-5 rounded-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#D5BDAF]/20 outline-none transition" 
              onChange={e => setP(e.target.value)} 
            />
          </div>
          
          <button type="submit" className="w-full bg-[#212529] text-white py-6 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-black transition-all">
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
}
