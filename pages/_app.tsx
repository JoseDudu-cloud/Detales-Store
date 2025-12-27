
import type { AppProps } from 'next/app';
import { StoreProvider } from '@/context/StoreContext';
import MainLayout from '@/components/MainLayout';
import '@/styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith('/admin');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Evita erro de hidratação entre servidor e cliente
  }

  return (
    <StoreProvider>
      {isAdmin ? (
        <Component {...pageProps} />
      ) : (
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      )}
    </StoreProvider>
  );
}
