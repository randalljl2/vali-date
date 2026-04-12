'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { joinWaitlist } from '@/lib/actions'

interface WaitlistFormProps {
  placeholder?: string
  buttonLabel?: string
}

export function WaitlistForm({
  placeholder = 'Enter your email',
  buttonLabel = 'Join waitlist',
}: WaitlistFormProps) {
  const [email, setEmail]   = useState('')
  const [joined, setJoined] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await joinWaitlist(email)
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setJoined(true)
    }
  }

  if (joined) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-surface border border-[#2db896]/30 text-cream font-body text-sm">
        <span className="text-[#2db896] text-base">✓</span>
        You&apos;re on the list — we&apos;ll be in touch.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        disabled={loading}
        className="flex-1 px-5 py-3.5 rounded-full bg-surface border border-rim text-cream placeholder:text-muted font-body text-sm outline-none focus:border-accent/60 transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-accent text-cream font-body font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60 whitespace-nowrap"
      >
        {loading ? 'Joining…' : buttonLabel} {!loading && <ArrowRight size={15} />}
      </button>
      {error && (
        <p className="text-xs text-accent/80 font-body mt-1 text-center w-full sm:col-span-2">
          {error}
        </p>
      )}
    </form>
  )
}
