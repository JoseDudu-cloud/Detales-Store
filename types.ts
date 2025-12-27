
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  collection: string;
  tags: string[];
  isGift: boolean;
  viewCount: number;
  cartAddCount: number;
  createdAt: number;
  stock: number;
}

export enum Tag {
  NEW = 'Novidade',
  BESTSELLER = 'Mais Vendido',
  GIFT = 'Sugestão de Presente',
  LIMITED = 'Edição Limitada',
  LIVE_OFFER = 'Oferta da Live'
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'superadmin' | 'editor';
  createdAt: number;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  enabled: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink?: string;
}

export interface StoreSettings {
  isLiveOn: boolean;
  logoType: 'text' | 'image';
  logoText: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  headline: string;
  subheadline: string;
  heroImageUrl: string;
  whatsappNumber: string;
  whatsappTemplateLive: string;
  whatsappTemplateRegular: string;
  freeShippingThreshold: number;
  hotbarMessages: { id: string; text: string; enabled: boolean }[];
  trustIcons: { icon: string; text: string; enabled: boolean }[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  instagramSection: {
    enabled: boolean;
    useApi: boolean;
    accessToken: string;
    userId: string;
    fetchCount: number;
    title: string;
    username: string;
    profileUrl: string;
    buttonText: string;
    posts: InstagramPost[];
  };
  categories: string[];
  tags: string[];
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    tiktok: string;
  };
  institutional: {
    about: string;
    shipping: string;
    returns: string;
    warranty: string;
  };
  contactEmail: string;
  footerContent: string;
}

export interface AnalyticsData {
  visitors: number;
  productViews: number;
  addedToCart: number;
  whatsappCheckouts: number;
  abandonedCarts: number;
  revenue: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}
