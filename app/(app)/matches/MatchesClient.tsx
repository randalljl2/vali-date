'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TierBadge } from '@/components/TierBadge'
import { UpgradeModal } from '@/components/UpgradeModal'
import { getTier, TIER_COLORS } from '@/lib/utils'
import type { SubscriptionTier, UserProfile } from '@/types'

interface NearMatchRow {
  id: string
  rater_id: string
  rated_id: string
  score: number
  created_at: string
  rated: Pick<UserProfile, 'id' | 'name' | 'photo_url' | 'average_score'> | null
}

interface Props {
  nearMatches: NearMatchRow[]
  subscriptionTier: SubscriptionTier
  /** Near match IDs where B (the rated person) has already sent a convince me to A */
  receivedConvinceMe: string[]
}

export function MatchesClient({ nearMatches, subscriptionTier, receivedConvinceMe }: Props) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const receivedSet = new Set(receivedConvinceMe)

  const isFree = subscriptionTier === 'free'

  if (nearMatches.length === 0) return null

  return (
    <>
      <div className="space-y-2">
        {nearMatches.map((nm) => {
          const rated = nm.rated
          const hasMessage = receivedSet.has(nm.id)

          if (isFree || !rated) {
            return (
              <div
                key={nm.id}
                className="flex items-center gap-3 p-4 rounded-2xl border border-rim bg-surface"
              >
                <div className="w-12 h-12 rounded-full bg-rim flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-cream">Someone you rated a 4</p>
                  <p className="text-xs text-muted font-body">
                    Upgrade to see who — they may send you a message
                  </p>
                </div>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex-shrink-0 text-xs font-body font-semibold text-[#e8c46a] border border-[#e8c46a]/30 px-2.5 py-1 rounded-lg hover:bg-[#e8c46a]/10 transition-colors"
                >
                  Unlock
                </button>
              </div>
            )
          }

          const tier = getTier(rated.average_score)
          return (
            <div
              key={nm.id}
              className="flex items-center gap-3 p-4 rounded-2xl border border-rim bg-surface"
            >
              <div
                className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2"
                style={{ borderColor: TIER_COLORS[tier] }}
              >
                {rated.photo_url ? (
                  <Image
                    src={rated.photo_url}
                    alt={rated.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full bg-rim flex items-center justify-center">
                    <span className="font-display font-bold text-sm" style={{ color: TIER_COLORS[tier] }}>
                      {rated.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body font-semibold text-cream">{rated.name}</span>
                  <TierBadge score={rated.average_score} size="sm" />
                </div>
                <p className="text-xs text-muted font-body">you gave them a {nm.score}</p>
              </div>
              {hasMessage ? (
                <span className="flex-shrink-0 text-xs font-body text-accent font-semibold">
                  Message ↑
                </span>
              ) : (
                <span className="flex-shrink-0 text-xs text-muted font-body">Waiting…</span>
              )}
            </div>
          )
        })}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
