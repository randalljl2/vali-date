import type { Metadata } from 'next'
import { Fraunces, Lora, DM_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ValiDate — A return to honest dating.',
  description:
    'The dating app built around compatibility, not algorithms. Answer honestly. Get matched. Connect.',
  openGraph: {
    title: 'ValiDate',
    description: 'A return to honest dating.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${lora.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-bg text-ink font-body antialiased">
        {children}
      </body>
    </html>
  )
}
