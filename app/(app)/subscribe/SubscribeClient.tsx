'use client'

import { useState } from 'react'
import { simulateUpgrade } from '@/lib/actions'
import { Check, Zap } from 'lucide-react'
import type { SubscriptionTier } from '@/types'
import Link from 'next/link'

interface Props {
  currentTier: SubscriptionTier
}

const FREE_FEATURES = [
  'Full discover feed with compatibility scores',
  'Express interest & get matched',
  'Chat with all your matches',
  'Answer all 100 compatibility questions',
  'Daily confidence score',
]

const PAID_FEATURES = [
  'Everything in Free',
  'See who liked you',
  'Priority placement in discover feed',
  'Read receipts in chat',
  'Compatibility insights & breakdown',
]

export function SubscribeClient({ currentTier }: Props) {
  const [loading, setLoading] = useState(false)
  const [activeTier, setActiveTier] = useState(currentTier)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isPaid = activeTier !== 'free'

  async function handleUpgrade() {
    if (isPaid || loading) return
    setLoading(true)
    setError(null)
    const result = await simulateUpgrade('plus')
    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    setActiveTier('plus')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleDowngrade() {
    if (!isPaid || loading) return
    setLoading(true)
    setError(null)
    const result = await simulateUpgrade('free')
    setLoading(false)
    if ('error' in result) { setError(result.error); return }
    setActiveTier('free')
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-8 bg-bg">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-display font-bold text-3xl text-ink">Choose your plan</h1>
        <p className="text-muted font-body text-sm max-w-xs mx-auto leading-relaxed">
          ValiDate is free to use. Upgrade for features that help you go deeper.
        </p>
      </div>

      {/* Free plan */}
      <div className={`rounded-2xl border p-5 space-y-4 transition-all ${
        !isPaid ? 'border-ink/20 bg-surface' : 'border-border bg-surface'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-body font-semibold text-ink text-base">Free</div>
            <div className="text-sm text-muted font-body mt-0.5">Always free</div>
          </div>
          {!isPaid && (
            <span className="text-xs font-body px-2.5 py-1 rounded-full border border-border text-muted">
              Current plan
            </span>
          )}
        </div>

        <ul className="space-y-2.5">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm font-body text-ink-2">
              <Check size={14} className="mt-0.5 flex-shrink-0 text-muted" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {isPaid && (
          <button
            onClick={handleDowngrade}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-body border border-border text-muted hover:text-ink-2 hover:border-ink/20 transition-colors disabled:opacity-60"
          >
            {loading ? 'Switching…' : 'Switch to Free'}
          </button>
        )}
      </div>

      {/* Paid plan */}
      <div className={`mt-4 rounded-2xl border p-5 space-y-4 transition-all ${
        isPaid ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accent flex-shrink-0" />
            <div>
              <div className="font-body font-semibold text-ink text-base">ValiDate Plus</div>
              <div className="text-sm font-body mt-0.5" style={{ color: '#7a2535' }}>$7.99 / month</div>
            </div>
          </div>
          {isPaid && (
            <span className="text-xs font-body px-2.5 py-1 rounded-full border border-accent/30 text-accent">
              Current plan
            </span>
          )}
        </div>

        <ul className="space-y-2.5">
          {PAID_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm font-body text-ink-2">
              <Check size={14} className="mt-0.5 flex-shrink-0 text-accent" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {!isPaid && (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-body font-semibold bg-accent text-white hover:bg-accent-soft transition-colors disabled:opacity-60"
          >
            {loading ? 'Upgrading…' : success ? '✓ Upgraded!' : 'Upgrade to Plus'}
          </button>
        )}
      </div>

      {error && (
        <p className="text-accent text-xs font-body text-center mt-4">{error}</p>
      )}

      {/* Simulated notice */}
      <div className="mt-5 bg-surface border border-border rounded-xl px-4 py-3 text-xs text-muted font-body text-center">
        Payment processing coming soon. The upgrade button sets your tier directly for testing.
      </div>

      <Link
        href="/profile"
        className="mt-5 text-center text-xs text-muted font-body hover:text-ink-2 transition-colors"
      >
        ← Back to profile
      </Link>
    </div>
  )
}
