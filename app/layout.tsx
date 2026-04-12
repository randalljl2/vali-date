import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vali Date — Be Rated. Be Real. Be Ready.',
  description:
    'Rate and be rated. Mutual 5+ unlocks a match. Your score is always honest.',
  openGraph: {
    title: 'Vali Date',
    description: 'Be Rated. Be Real. Be Ready.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-bg text-cream font-body antialiased">
        {children}
      </body>
    </html>
  )
}
