
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from './Home';

const Catalog: React.FC = () => {
  const { products, settings } = useStore();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const query = new URLSearchParams(location.search);
  const catParam = query.get('cat');
  const collectionParam = query.get('collection');
  const isGiftsPage = location.pathname.includes('/gifts');
  
  const isGiftsFiltered = isGiftsPage || catParam === 'Kits & Presentes';

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = catParam ? p.category === catParam : true;
    const matchesCol = collectionParam ? p.collection === collectionParam : true;
    const matchesGift = isGiftsFiltered ? (p.isGift === true || p.category === 'Kits & Presentes') : true;
    return matchesSearch && matchesCat && matchesCol && matchesGift;
  });

  const collections = Array.from(new Set(products.map(p => p.collection)));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">
          {isGiftsPage ? 'Especial de Presentes' : catParam || collectionParam || 'Nossas Peças'}
        </h1>
        <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px]">
          Curadoria exclusiva Detalhes Store
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(setSearchTerm(e.target.value))}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-[#D5BDAF]"
            />
          </div>

          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-6 text-gray-400 flex items-center space-x-2">
              <SlidersHorizontal size={12} />
              <span>Categorias</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/catalog" className={`text-xs uppercase tracking-widest transition-colors ${!catParam && !isGiftsPage ? 'text-[#D5BDAF] font-bold' : 'text-gray-600 hover:text-black'}`}>Tudo</Link>
              </li>
              {settings.categories.map(c => (
                <li key={c}>
                  <Link 
                    to={c === 'Kits & Presentes' ? '/gifts' : `/catalog?cat=${c}`} 
                    className={`text-xs uppercase tracking-widest hover:text-[#D5BDAF] transition-colors ${catParam === c || (c === 'Kits & Presentes' && isGiftsPage) ? 'text-[#D5BDAF] font-bold' : 'text-gray-600'}`}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {collections.length > 0 && (
            <div>
                <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] mb-6 text-gray-400">Coleções</h3>
                <ul className="space-y-3">
                {collections.map(c => (
                    <li key={c}>
                    <Link to={`/catalog?collection=${c}`} className={`text-xs uppercase tracking-widest hover:text-[#D5BDAF] transition-colors ${collectionParam === c ? 'text-[#D5BDAF] font-bold' : 'text-gray-600'}`}>{c}</Link>
                    </li>
                ))}
                </ul>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-serif italic text-lg">Nenhum detalhe encontrado com estes filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
