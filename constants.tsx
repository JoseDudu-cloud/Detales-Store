
import { StoreSettings, Product } from './types';

export const INITIAL_SETTINGS: StoreSettings = {
  isLiveOn: false,
  logoType: 'text',
  logoText: 'DETALHES',
  logoUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&h=50&q=80',
  primaryColor: '#D5BDAF',
  secondaryColor: '#F5EBE0',
  headline: 'Detalhes que transformam seu brilho',
  subheadline: 'Semijoias banhadas a Ouro 18k. Elegância em cada escolha para mulheres que escrevem sua própria história.',
  heroImageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
  whatsappNumber: '5511999999999',
  whatsappTemplateLive: 'Olá Detalhes! ✨ Quero aproveitar os mimos da LIVE: {productList}. Total: {totalPrice}. Código da Live: {liveCode}',
  whatsappTemplateRegular: 'Olá Detalhes! ✨ Me apaixonei por estas peças: {productList}. Total: {totalPrice}. Como finalizo?',
  freeShippingThreshold: 299,
  contactEmail: 'contato@detalhesstore.com.br',
  footerContent: 'Elevando sua essência através de detalhes minimalistas e cheios de significado.',
  categories: ['Brincos', 'Colares', 'Pulseiras', 'Anéis', 'Kits & Presentes'],
  tags: ['Novidade', 'Mais Vendido', 'Sugestão de Presente', 'Edição Limitada', 'Oferta da Live'],
  hotbarMessages: [
    { id: '1', text: '✨ FRETE GRÁTIS ACIMA DE R$ 299', enabled: true },
    { id: '2', text: '🚚 ENVIO IMEDIATO EM 24H', enabled: true },
    { id: '3', text: '🎁 EMBALAGEM EXCLUSIVA INCLUSA', enabled: true },
    { id: '4', text: '💎 GARANTIA ETERNA NO BANHO', enabled: true }
  ],
  trustIcons: [
    { icon: 'Shipping', text: 'Envio Express', enabled: true },
    { icon: 'Gift', text: 'Mimo na Caixinha', enabled: true },
    { icon: 'Shield', text: 'Garantia Premium', enabled: true }
  ],
  testimonials: [
    { id: '1', name: 'Ana Beatriz', text: 'As peças são impecáveis. O brilho do banho é muito superior ao que eu esperava. Com certeza voltarei a comprar.', rating: 5, enabled: true },
    { id: '2', name: 'Carla Silveira', text: 'Atendimento nota mil via WhatsApp. Me ajudaram a escolher o presente perfeito e chegou em 2 dias.', rating: 5, enabled: true },
    { id: '3', name: 'Mariana Costa', text: 'Embalagem linda e cheirosa! Um detalhe que faz toda a diferença.', rating: 5, enabled: true }
  ],
  faqs: [
    { id: '1', question: 'As peças possuem garantia?', answer: 'Sim! Todas as nossas semijoias possuem 1 ano de garantia no banho e garantia vitalícia contra defeitos de fabricação.', enabled: true },
    { id: '2', question: 'Qual o prazo de envio?', answer: 'Realizamos postagens diárias. Após a confirmação do pagamento, seu pedido é enviado em até 24 horas úteis.', enabled: true },
    { id: '3', question: 'As peças são antialérgicas?', answer: 'Sim, nossas peças recebem uma camada de verniz de proteção antialérgico e são livres de níquel.', enabled: true }
  ],
  instagramSection: {
    enabled: true,
    useApi: false,
    accessToken: '',
    userId: '',
    fetchCount: 8,
    title: 'Siga-nos no Instagram',
    username: '@detalhesstore',
    profileUrl: 'https://instagram.com/detalhesstore',
    buttonText: 'Ver Perfil no Instagram',
    posts: [
      { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80' },
      { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1599643478123-242f151145f0?auto=format&fit=crop&w=400&q=80' },
      { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80' },
      { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  socialLinks: {
    instagram: 'https://instagram.com/detalhesstore',
    facebook: 'https://facebook.com/detalhesstore',
    whatsapp: 'https://wa.me/5511999999999',
    tiktok: 'https://tiktok.com/@detalhesstore'
  },
  institutional: {
    about: 'Nossa história começou com o desejo de oferecer mais que semijoias: queríamos oferecer confiança. Cada peça é selecionada com olhar curatorial para a mulher moderna.',
    shipping: 'Enviamos para todo o Brasil via Correios e Transportadoras. O prazo médio de postagem é de 24h úteis após a confirmação do pagamento.',
    returns: 'Você tem até 7 dias após o recebimento para solicitar a troca ou devolução sem custos, desde que a peça esteja sem sinais de uso.',
    warranty: 'Nossas peças possuem garantia de 1 ano no banho de Ouro 18k e garantia vitalícia contra defeitos de fabricação.'
  }
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Argola Gota - Ouro 18k',
    price: 189.90,
    description: 'Leveza e brilho inigualável. O detalhe que faltava.',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'],
    category: 'Brincos',
    collection: 'Essencial',
    tags: ['Mais Vendido', 'Novidade'],
    isGift: false,
    viewCount: 1250,
    cartAddCount: 145,
    createdAt: Date.now() - 86400000,
    stock: 8
  },
  {
    id: '2',
    name: 'Riviera Zircônia Cristal',
    price: 249.90,
    description: 'Um clássico que exala sua confiança natural.',
    images: ['https://images.unsplash.com/photo-1599643478123-242f151145f0?auto=format&fit=crop&w=800&q=80'],
    category: 'Colares',
    collection: 'Noite',
    tags: ['Edição Limitada', 'Novidade'],
    isGift: false,
    viewCount: 3400,
    cartAddCount: 210,
    createdAt: Date.now() - 172800000,
    stock: 3
  },
  {
    id: '3',
    name: 'Pulseira Elo Português',
    price: 149.90,
    description: 'Feminilidade e sofisticação em cada movimento.',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'],
    category: 'Pulseiras',
    collection: 'Minimal',
    tags: ['Mais Vendido'],
    isGift: false,
    viewCount: 890,
    cartAddCount: 67,
    createdAt: Date.now() - 432000000,
    stock: 12
  }
];
