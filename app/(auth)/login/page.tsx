'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/actions'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
      <div className="text-center space-y-1">
        <h1 className="font-display font-bold text-3xl text-ink">Welcome back</h1>
        <p className="text-muted font-body text-sm">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted font-body font-medium uppercase tracking-wider">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="field"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted font-body font-medium uppercase tracking-wider">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="field pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-2 transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm font-body text-accent bg-accent/8 border border-accent/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-accent text-white font-body font-medium text-sm hover:bg-accent-soft transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-muted font-body">
        No account?{' '}
        <Link href="/signup" className="text-ink-2 underline underline-offset-2 hover:text-accent">
          Create one
        </Link>
      </p>
    </div>
  )
}
