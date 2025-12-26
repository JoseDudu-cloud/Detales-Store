import './globals.css';
import { Playfair_Display, Inter } from 'next/font/google';
import { StoreProvider } from '../context/StoreContext';
import MainLayout from '../components/MainLayout';
import type { Metadata } from 'next';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Detalhes Store | Semijoias Premium',
  description: 'Semijoias banhadas a Ouro 18k. Elegância e brilho em cada detalhe para mulheres protagonistas.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className={`${playfair.variable} ${inter.variable} font-sans`}>
        <StoreProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </StoreProvider>
      </body>
    </html>
  );
}