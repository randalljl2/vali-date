'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/actions'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError("Passwords don't match"); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    const result = await signUp(email, password)
    setLoading(false)
    if (result?.error) setError(result.error)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="animate-fade-in-up text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-green-100 border border-green-300 flex items-center justify-center mx-auto text-2xl text-green-700">
          ✓
        </div>
        <h2 className="font-display font-bold text-2xl text-ink">Check your email</h2>
        <p className="text-muted font-body text-sm leading-relaxed">
          We sent a confirmation link to{' '}
          <span className="text-ink font-medium">{email}</span>.
          Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 px-6 py-3 rounded-xl bg-accent text-white font-body font-medium text-sm hover:bg-accent-soft transition-colors"
        >
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="text-center space-y-1">
        <h1 className="font-display font-bold text-3xl text-ink">Create account</h1>
        <p className="text-muted font-body text-sm">Join ValiDate</p>
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
              placeholder="8+ characters"
              required
              autoComplete="new-password"
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

        <div className="space-y-1.5">
          <label className="text-xs text-muted font-body font-medium uppercase tracking-wider">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className="field"
          />
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-muted font-body">
        Already have an account?{' '}
        <Link href="/login" className="text-ink-2 underline underline-offset-2 hover:text-accent">
          Sign in
        </Link>
      </p>
    </div>
  )
}
