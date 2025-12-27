
import React, { useEffect, useState } from 'react';
// Use namespace import and any-casting to bypass 'no exported member' errors
import * as ReactRouterDOM from 'react-router-dom';
import { useStore } from '../store';
import { ChevronRight, ShoppingBag, Shield, Truck, Package, Heart, Star, Sparkles, Image as ImageLucide } from 'lucide-react';

const { useParams, useNavigate } = ReactRouterDOM as any;

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, recordEvent } = useStore();
  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (product) {
      recordEvent('view');
      window.scrollTo(0, 0);
      setActiveImage(0);
    }
  }, [product, recordEvent]);

  if (!product) {
    return <div className="p-20 text-center font-serif text-xl">Peça não encontrada no catálogo.</div>;
  }

  const handleAddToCart = () => {
    addToCart(product.id);
    navigate('/cart');
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-6 py-12 md:py-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-16">
        <a href="/" className="hover:text-black transition">Início</a>
        <ChevronRight size={10} />
        <a href="/catalog" className="hover:text-black transition">Catálogo</a>
        <ChevronRight size={10} />
        <span className="text-black font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
        {/* Images */}
        <div className="space-y-6">
          <div className="aspect-[3/4] overflow-hidden rounded-[2rem] bg-gray-50 shadow-sm relative border border-gray-100">
            {product.images && product.images[activeImage] ? (
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                 <ImageLucide size={48} strokeWidth={1} />
              </div>
            )}
            
            <div className="absolute top-6 left-6 flex flex-col space-y-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="text-[9px] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-[0.2em] font-bold text-[#D5BDAF] shadow-sm">
                    {tag}
                  </span>
                ))}
            </div>

            {product.stock <= 5 && (
              <div className="absolute bottom-6 left-6 bg-red-500 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                <Sparkles size={12} fill="white" />
                <span>Últimas {product.stock} unidades</span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-24 aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${activeImage === i ? 'border-[#D5BDAF] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col pt-4">
          <div className="mb-4">
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-400">{product.category}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">{product.name}</h1>
          
          <div className="flex items-center space-x-2 mb-8">
            <div className="flex text-[#D5BDAF]">
              {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
            </div>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Líder em satisfação</span>
          </div>

          <div className="mb-10">
            <p className="text-3xl font-bold text-[#212529] mb-2 tracking-tight">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-widest border-l-2 border-[#D5BDAF] pl-4">
              Até 6x de R$ {(product.price / 6).toFixed(2)} sem juros
            </p>
          </div>

          <div className="border-y border-gray-100 py-10 mb-10">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 text-gray-400">Sobre esta peça</h3>
            <p className="text-gray-600 leading-relaxed text-lg font-light italic font-serif">
              "{product.description}"
            </p>
          </div>

          <div className="flex space-x-4 mb-12">
            <button 
              onClick={handleAddToCart}
              className="flex-grow bg-[#212529] text-white py-6 rounded-full uppercase tracking-[0.25em] font-bold text-xs hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span>Garantir minha peça</span>
            </button>
            <button className="p-6 border border-gray-200 rounded-full hover:bg-red-50 hover:border-red-100 transition-colors group shadow-sm">
              <Heart size={20} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-[#FAF7F2] rounded-full"><Truck size={20} className="text-[#D5BDAF]" /></div>
              <p className="text-[9px] uppercase tracking-widest font-bold">Envio Express</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-[#FAF7F2] rounded-full"><Shield size={20} className="text-[#D5BDAF]" /></div>
              <p className="text-[9px] uppercase tracking-widest font-bold">Garantia Premium</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-[#FAF7F2] rounded-full"><Package size={20} className="text-[#D5BDAF]" /></div>
              <p className="text-[9px] uppercase tracking-widest font-bold">Gift Box Inclusa</p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-[#FAF7F2] rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 shadow-sm">
             <div className="flex -space-x-4">
                {[1,2,3,4,5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/150?u=${i*100}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" alt="Buyer" />
                ))}
             </div>
             <div className="text-center md:text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-700">Escolha de +500 mulheres</p>
                <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#D5BDAF] mt-1">Garantia de brilho e durabilidade</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
