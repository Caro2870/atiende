import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const url = 'https://atiende.prittor.com'

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: 'Atiende — Tu negocio responde solo por WhatsApp, 24/7',
  description:
    'Automatiza los mensajes de WhatsApp de tu restaurante, clínica o salón en Lima. Respuestas instantáneas para nunca perder un cliente. Primer mes gratis.',
  keywords: [
    'chatbot whatsapp lima',
    'automatizar whatsapp negocio',
    'bot whatsapp peru',
    'respuestas automaticas whatsapp',
    'chatbot restaurante lima',
    'whatsapp business automatico',
    'atiende negocios lima',
  ],
  authors: [{ name: 'Prittor', url: 'https://prittor.com' }],
  creator: 'Prittor',
  publisher: 'Prittor',
  alternates: {
    canonical: url,
  },
  openGraph: {
    type: 'website',
    url,
    title: 'Atiende — Tu negocio responde solo por WhatsApp, 24/7',
    description:
      'Automatiza los mensajes de WhatsApp de tu restaurante, clínica o salón en Lima. Primer mes gratis.',
    siteName: 'Atiende',
    locale: 'es_PE',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Atiende — Tu negocio responde solo por WhatsApp, 24/7' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atiende — Tu negocio responde solo por WhatsApp, 24/7',
    description:
      'Automatiza los mensajes de WhatsApp de tu negocio en Lima. Respuestas instantáneas 24/7.',
    creator: '@prittor',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text font-body antialiased">{children}</body>
      <Script defer src="https://analytics.prittor.com/script.js" data-website-id="7bdf2b89-54c1-49d4-8ae5-6357598a6130" strategy="afterInteractive" />
    </html>
  )
}
