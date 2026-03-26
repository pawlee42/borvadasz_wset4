import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Borvadász Társaság - Borkóstoló',
  description:
    'Szisztematikus borkóstoló alkalmazás a Borvadász Társaság tagjainak. Értékeld a borokat a SAT módszer szerint.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body
        className={`${inter.variable} bg-background text-foreground font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
