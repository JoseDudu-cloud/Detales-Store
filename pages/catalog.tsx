
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/context/StoreContext';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function Catalog() {
  const { products, settings, addToCart } = useStore();
  const router = useRouter();
  const { cat } = router.query;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = cat ? p.category === cat : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">{cat || 'Nossas Peças'}</h1>
        <p className="text-gray-400 uppercase tracking-widest text-[10px]">Curadoria exclusiva Detalhes Store</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-50 border border-gray-100 outline-none text-sm focus:border-[#D5BDAF]"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-6 text-gray-400 flex items-center gap-2">
              <SlidersHorizontal size={12} /> Categorias
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/catalog" 
                  className={`text-xs uppercase tracking-widest transition-colors ${!cat ? 'text-[#D5BDAF] font-bold' : 'text-gray-600 hover:text-black'}`}
                >
                  Tudo
                </Link>
              </li>
              {settings.categories.map((c: string) => (
                <li key={c}>
                  <Link 
                    href={`/catalog?cat=${c}`} 
                    className={`text-xs uppercase tracking-widest transition-colors ${cat === c ? 'text-[#D5BDAF] font-bold' : 'text-gray-600 hover:text-[#D5BDAF]'}`}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-grow grid grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="font-serif italic text-gray-400">Nenhuma joia encontrada com estes termos.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="group">
                <Link href={`/product/${product.id}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-3xl mb-4 bg-gray-50 border border-gray-100 shadow-sm">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </div>
                </Link>
                <div className="text-center">
                  <h3 className="text-[11px] uppercase tracking-widest text-gray-400 mb-1 group-hover:text-black transition-colors">{product.name}</h3>
                  <p className="font-serif font-bold text-gray-800">R$ {product.price.toFixed(2)}</p>
                  <button 
                    onClick={() => addToCart(product.id)} 
                    className="mt-4 bg-gray-50 p-3 rounded-full hover:bg-[#212529] hover:text-white transition-all shadow-sm"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
