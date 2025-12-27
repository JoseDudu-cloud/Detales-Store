
import type { Metadata } from 'next';
import { StoreProvider } from '@/context/StoreContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Detalhes Store - Premium Jewelry',
  description: 'Semijoias banhadas a Ouro 18k. Elegância e brilho em cada detalhe.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
