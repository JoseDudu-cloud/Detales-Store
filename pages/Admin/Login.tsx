
import React, { useState } from 'react';
// Use namespace import and any-casting to bypass 'no exported member' errors
import * as ReactRouterDOM from 'react-router-dom';
import { useStore } from '../../store';
import { Lock, User as UserIcon, ArrowRight, Loader2, Eye, EyeOff, Home, ArrowLeft } from 'lucide-react';

const { useNavigate, Link } = ReactRouterDOM as any;

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 selection:bg-[#D5BDAF] selection:text-white">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 md:p-14 animate-fade-in border border-gray-100 relative">
        
        {/* Back to Home Link */}
        <Link 
          to="/" 
          className="absolute top-8 left-10 flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-black transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Loja</span>
        </Link>

        <div className="text-center mb-12 pt-4">
          <div className="inline-block p-4 bg-[#FAF7F2] rounded-full mb-6 text-[#D5BDAF]">
            <Lock size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-serif tracking-[0.2em] font-bold mb-2">ACESSO RESTRITO</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-medium">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Username Input */}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D5BDAF] transition-colors">
                <UserIcon size={18} strokeWidth={1.5} />
              </div>
              <input 
                type="text" 
                placeholder="Usuário ou E-mail"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-full focus:bg-white focus:border-[#D5BDAF]/30 transition-all outline-none text-sm disabled:opacity-50 shadow-sm"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D5BDAF] transition-colors">
                <Lock size={18} strokeWidth={1.5} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-16 pr-14 py-5 bg-gray-50 border border-transparent rounded-full focus:bg-white focus:border-[#D5BDAF]/30 transition-all outline-none text-sm disabled:opacity-50 shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 px-6 py-4 rounded-3xl border border-red-100 animate-slide-up">
              <p className="text-red-500 text-center text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#212529] text-white py-6 rounded-full uppercase tracking-[0.3em] font-bold text-xs hover:bg-black hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-3 group disabled:opacity-50"
          >
            {loading ? (
                <Loader2 className="animate-spin" size={18} />
            ) : (
                <>
                    <span>Entrar no Painel</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>
        
        <div className="mt-12 text-center">
          <Link to="/" className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-black transition-colors flex items-center justify-center space-x-2">
            <Home size={12} />
            <span>Voltar para a Loja</span>
          </Link>
          <p className="mt-8 text-[9px] text-gray-300 uppercase tracking-[0.4em] font-medium">Security-First Protocol</p>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({size, className}: {size: number, className: string}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
)

export default AdminLogin;
