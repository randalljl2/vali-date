'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/actions'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn(email, password)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/discover')
      router.refresh()
    }
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display font-bold text-3xl text-cream">Welcome back</h1>
        <p className="text-muted font-body text-sm">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-body font-medium uppercase tracking-wide">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-rim text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/60 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted font-body font-medium uppercase tracking-wide">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-11 rounded-xl bg-surface border border-rim text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm font-body text-accent bg-accent/10 border border-accent/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-accent text-cream font-body font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-muted font-body">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-cream underline underline-offset-2 hover:text-accent">
          Sign up
        </Link>
      </p>
    </div>
  )
}
