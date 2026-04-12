'use client'

import { useState } from 'react'
import { simulateUpgrade } from '@/lib/actions'
import { Crown, Zap, Check, Sparkles } from 'lucide-react'
import type { SubscriptionTier } from '@/types'
import Link from 'next/link'

interface Props {
  currentTier: SubscriptionTier
}

const TIERS = [
  {
    id: 'free' as SubscriptionTier,
    name: 'Free',
    price: null,
    icon: null,
    color: '#8a7878',
    features: [
      'Anonymous near match alerts',
      '20 ratings per day',
      'Basic discover feed',
    ],
    cta: 'Current plan',
  },
  {
    id: 'plus' as SubscriptionTier,
    name: 'Vali Date Plus',
    price: '$9.99/mo',
    icon: Zap,
    color: '#e8c46a',
    features: [
      'See exactly who rated you a 4',
      'Send one "convince me" per near match',
      'Full rating history',
      'Everything in Free',
    ],
    cta: 'Upgrade to Plus',
  },
  {
    id: 'premium' as SubscriptionTier,
    name: 'Vali Date Premium',
    price: '$19.99/mo',
    icon: Crown,
    color: '#9b6dff',
    features: [
      'See who rated you any score',
      'Unlimited convince me messages',
      'Weekly 60-min hot streak boost',
      'Everything in Plus',
    ],
    cta: 'Upgrade to Premium',
  },
]

export function SubscribeClient({ currentTier }: Props) {
  const [loading, setLoading] = useState<SubscriptionTier | null>(null)
  const [success, setSuccess] = useState<SubscriptionTier | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTier, setActiveTier] = useState(currentTier)

  async function handleUpgrade(tier: SubscriptionTier) {
    if (tier === activeTier || loading) return
    setLoading(tier)
    setError(null)

    const result = await simulateUpgrade(tier)
    setLoading(null)

    if ('error' in result) {
      setError(result.error)
      return
    }

    setActiveTier(tier)
    setSuccess(tier)
    setTimeout(() => setSuccess(null), 3000)
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-8 gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles size={20} className="text-[#e8c46a]" />
          <h1 className="font-display font-bold text-2xl text-cream">Choose your plan</h1>
        </div>
        <p className="text-muted font-body text-sm max-w-xs mx-auto">
          Unlock more ways to connect and stand out.
        </p>
      </div>

      {/* Tier cards */}
      <div className="space-y-4">
        {TIERS.map((tier) => {
          const Icon = tier.icon
          const isActive = activeTier === tier.id
          const isLoading = loading === tier.id
          const isSucceeded = success === tier.id
          const isDowngrade = TIERS.findIndex(t => t.id === tier.id) < TIERS.findIndex(t => t.id === activeTier)

          return (
            <div
              key={tier.id}
              className="rounded-2xl border p-5 space-y-4 transition-all"
              style={{
                borderColor: isActive ? tier.color : '#2c2228',
                background: isActive ? `${tier.color}08` : '#1c1618',
              }}
            >
              {/* Tier header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {Icon && <Icon size={18} style={{ color: tier.color }} />}
                  <div>
                    <div className="font-body font-semibold text-cream text-sm">{tier.name}</div>
                    {tier.price && (
                      <div className="text-xs font-body mt-0.5" style={{ color: tier.color }}>
                        {tier.price}
                      </div>
                    )}
                  </div>
                </div>
                {isActive && (
                  <span
                    className="text-xs font-body px-2 py-0.5 rounded-full border"
                    style={{ color: tier.color, borderColor: `${tier.color}50` }}
                  >
                    Current
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs font-body text-muted">
                    <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {!isActive && (
                <button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={!!loading}
                  className="w-full py-2.5 rounded-xl text-sm font-body font-semibold transition-colors disabled:opacity-60"
                  style={{
                    backgroundColor: isDowngrade ? 'transparent' : tier.color,
                    color: isDowngrade ? tier.color : '#0c0a0b',
                    border: isDowngrade ? `1px solid ${tier.color}50` : 'none',
                  }}
                >
                  {isLoading ? 'Upgrading…' : isSucceeded ? '✓ Done!' : isDowngrade ? 'Switch to this plan' : tier.cta}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Simulated upgrade notice */}
      <div className="bg-surface border border-rim rounded-xl px-4 py-3 text-xs text-muted font-body text-center">
        Payment processing coming soon. The &ldquo;Simulate upgrade&rdquo; button sets your tier directly for testing.
      </div>

      {error && (
        <p className="text-accent text-xs font-body text-center">{error}</p>
      )}

      <Link
        href="/profile"
        className="text-center text-xs text-muted font-body hover:text-cream transition-colors"
      >
        Back to profile
      </Link>
    </div>
  )
}
