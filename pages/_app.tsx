import type { AppProps } from 'next/app'
import { StoreProvider } from '@/context/StoreContext'
import MainLayout from '@/components/MainLayout'
import '@/styles/globals.css'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith('/admin');

  // No admin, não usamos o MainLayout da loja para evitar conflitos visuais
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
  )
}