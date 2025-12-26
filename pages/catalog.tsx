import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/pages/index';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Catalog() {
  const { products, settings } = useStore();
  const router = useRouter();
  const { cat, collection } = router.query;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = cat ? p.category === cat : true;
    const matchesCol = collection ? p.collection === collection : true;
    return matchesSearch && matchesCat && matchesCol;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          {cat || collection || 'Nossas Peças'}
        </h1>
        <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px]">Curadoria exclusiva Detalhes Store</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-50 border border-gray-100 text-sm outline-none focus:border-[#D5BDAF]"
            />
          </div>

          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-6 text-gray-400 flex items-center space-x-2">
              <SlidersHorizontal size={12} />
              <span>Categorias</span>
            </h3>
            <ul className="space-y-3">
              <li><Link href="/catalog" className={`text-xs uppercase tracking-widest ${!cat ? 'text-[#D5BDAF] font-bold' : 'text-gray-600'}`}>Tudo</Link></li>
              {settings.categories.map(c => (
                <li key={c}>
                  <Link href={`/catalog?cat=${c}`} className={`text-xs uppercase tracking-widest ${cat === c ? 'text-[#D5BDAF] font-bold' : 'text-gray-600'}`}>{c}</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-grow">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </div>
    </div>
  );
}