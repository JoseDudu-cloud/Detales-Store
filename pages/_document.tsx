import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <meta name="description" content="Detalhes Store | Semijoias Premium banhadas a Ouro 18k" />
      </Head>
      <body className="bg-[#FDFBF9] text-[#212529]">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}