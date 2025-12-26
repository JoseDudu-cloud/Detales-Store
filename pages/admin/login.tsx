import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/context/StoreContext';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const { login } = useStore();
  const router = useRouter();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(u, p)) router.push('/admin');
    else alert('Erro no login');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
      <form onSubmit={handle} className="bg-white p-12 rounded-[3rem] shadow-xl w-full max-w-md text-center">
        <div className="inline-block p-4 bg-gray-50 rounded-full mb-6"><Lock size={32} /></div>
        <h2 className="text-2xl font-serif font-bold mb-8">Acesso ADM</h2>
        <input type="text" placeholder="Usuário" className="w-full px-6 py-4 rounded-full bg-gray-50 mb-4 outline-none" onChange={e => setU(e.target.value)} />
        <input type="password" placeholder="Senha" className="w-full px-6 py-4 rounded-full bg-gray-50 mb-8 outline-none" onChange={e => setP(e.target.value)} />
        <button type="submit" className="w-full bg-[#212529] text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs">Entrar</button>
      </form>
    </div>
  );
}