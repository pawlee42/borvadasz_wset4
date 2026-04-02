import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
})

const newsreader = Newsreader({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#420b15',
}

export const metadata: Metadata = {
  title: 'Borvadász Társaság - Borkóstoló',
  description:
    'Szisztematikus borkóstoló alkalmazás a Borvadász Társaság tagjainak. Értékeld a borokat a SAT módszer szerint.',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Borvadász',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body
        className={`${inter.variable} ${newsreader.variable} bg-background text-foreground font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
