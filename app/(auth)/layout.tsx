import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="flex justify-center py-8 px-6">
        <Link href="/">
          <Logo size="lg" />
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
