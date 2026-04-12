'use client'

import { useState } from 'react'
import { ProfileCard } from '@/components/ProfileCard'
import { RatingButtons } from '@/components/RatingButtons'
import { TierBadge } from '@/components/TierBadge'
import { UpgradeModal } from '@/components/UpgradeModal'
import { ConvinceMeModal } from '@/components/ConvinceMeModal'
import { submitRating } from '@/lib/actions'
import { Flame, Heart, X, MessageCircle, Users, Eye } from 'lucide-react'
import type { UserProfile, UserPhoto, Streak, NearMatchWithRater, SubscriptionTier } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { TIER_COLORS, getTier, cn } from '@/lib/utils'

interface Props {
  initialProfiles: UserProfile[]
  photoMap: Record<string, UserPhoto[]>
  hotProfiles: UserProfile[]
  streakMap: Record<string, Streak>
  confidenceMap: Record<string, number>
  ratingsToday: number
  ratingsReceivedToday: number
  nearMatches: NearMatchWithRater[]
  subscriptionTier: SubscriptionTier
  sentConvinceMeNearMatchIds: string[]
  userId: string
}

const DAILY_LIMIT = 20

export function DiscoverClient({
  initialProfiles,
  photoMap,
  hotProfiles,
  streakMap,
  confidenceMap,
  ratingsToday,
  ratingsReceivedToday,
  nearMatches,
  subscriptionTier,
  sentConvinceMeNearMatchIds,
}: Props) {
  const [profiles] = useState(initialProfiles)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [sliding, setSliding] = useState<'left' | 'right' | null>(null)
  const [loading, setLoading] = useState(false)
  const [todayCount, setTodayCount] = useState(ratingsToday)

  const [matchedMap, setMatchedMap] = useState<Record<string, string>>({})
  const [matchFlash, setMatchFlash] = useState<{ name: string; matchId: string } | null>(null)

  // Upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Convince me modal — B (current user, rated) sends to A (rater)
  const [convinceTarget, setConvinceTarget] = useState<NearMatchWithRater | null>(null)
  const [sentConvinceMe, setSentConvinceMe] = useState<Set<string>>(
    new Set(sentConvinceMeNearMatchIds)
  )

  const current = profiles[currentIdx]
  const remaining = DAILY_LIMIT - todayCount

  function advance(direction: 'left' | 'right') {
    setSliding(direction)
    setTimeout(() => {
      setSliding(null)
      setCurrentIdx((i) => i + 1)
      setLoading(false)
    }, 320)
  }

  async function handleRate(score: number) {
    if (!current || loading || remaining <= 0) return
    setLoading(true)

    advance(score >= 5 ? 'right' : 'left')

    const result = await submitRating(current.id, score)
    setTodayCount((c) => c + 1)

    if ('matched' in result && result.matched && result.matchId) {
      setMatchedMap((m) => ({ ...m, [current.id]: result.matchId! }))
      setMatchFlash({ name: current.name, matchId: result.matchId })
      setTimeout(() => setMatchFlash(null), 4000)
    }
  }

  function handlePass() {
    if (!current || loading) return
    advance('left')
  }

  if (remaining <= 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
        <div className="text-4xl">⏳</div>
        <h2 className="font-display font-bold text-2xl text-cream">Daily limit reached</h2>
        <p className="text-muted font-body text-sm">
          You&apos;ve rated {DAILY_LIMIT} people today. Come back tomorrow.
        </p>
      </div>
    )
  }

  const isFree = subscriptionTier === 'free'
  const nearMatchCount = nearMatches.length

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-2xl text-cream">Discover</h1>
          {ratingsReceivedToday > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#2db896] font-body px-2.5 py-1 rounded-full bg-[#2db896]/10 border border-[#2db896]/30">
              <Users size={11} />
              {ratingsReceivedToday} rated you today
            </span>
          )}
        </div>
        <span className="text-xs text-muted font-body px-3 py-1.5 rounded-full border border-rim">
          {remaining} left today
        </span>
      </div>

      {/* Momentum card */}
      {ratingsReceivedToday > 0 && (
        <div className="bg-surface border border-[#2db896]/30 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#2db896]" />
            <span className="text-xs font-body font-semibold text-[#2db896] uppercase tracking-widest">
              Momentum
            </span>
          </div>
          <p className="mt-1.5 text-sm font-body text-cream">
            <span className="font-semibold">{ratingsReceivedToday} {ratingsReceivedToday === 1 ? 'person' : 'people'}</span> rated you today.
            {ratingsReceivedToday >= 5 ? ' You\'re having a moment.' : ' Keep it up.'}
          </p>
        </div>
      )}

      {/* Near match alerts */}
      {nearMatchCount > 0 && (
        <div className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-accent" />
              <span className="text-xs font-body font-semibold text-accent uppercase tracking-widest">
                Near Matches
              </span>
            </div>
            <span className="text-xs text-muted font-body">{nearMatchCount}</span>
          </div>

          {isFree ? (
            /* Free user — anonymous */
            <div
              className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-rim cursor-pointer hover:border-accent/30 transition-colors"
              onClick={() => setShowUpgradeModal(true)}
            >
              <div className="w-10 h-10 rounded-full bg-rim flex items-center justify-center flex-shrink-0">
                <span className="text-lg">👀</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-cream">
                  {nearMatchCount === 1
                    ? 'Someone\'s on the fence about you'
                    : `${nearMatchCount} people are on the fence about you`}
                </p>
                <p className="text-xs text-muted font-body mt-0.5">
                  Upgrade to see who it is
                </p>
              </div>
              <span className="text-xs text-accent font-body font-semibold flex-shrink-0">
                Unlock
              </span>
            </div>
          ) : (
            /* Plus / Premium — show who rated you + send convince me */
            <div className="space-y-2">
              {nearMatches.map((nm) => {
                const tier = getTier(nm.rater.average_score)
                const alreadySent = sentConvinceMe.has(nm.id)
                return (
                  <div
                    key={nm.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-rim"
                  >
                    <div
                      className="relative w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
                      style={{ borderColor: TIER_COLORS[tier] }}
                    >
                      {nm.rater.photo_url ? (
                        <Image
                          src={nm.rater.photo_url}
                          alt={nm.rater.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full bg-rim flex items-center justify-center">
                          <span className="font-display font-bold text-xs" style={{ color: TIER_COLORS[tier] }}>
                            {nm.rater.name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-body font-semibold text-cream">{nm.rater.name}</span>
                        <TierBadge score={nm.rater.average_score} size="sm" />
                      </div>
                      <p className="text-xs text-muted font-body">gave you a {nm.score}</p>
                    </div>
                    {alreadySent ? (
                      <span className="text-xs text-muted font-body flex-shrink-0">Sent ✓</span>
                    ) : (
                      <button
                        onClick={() => setConvinceTarget(nm)}
                        className="flex-shrink-0 text-xs font-body font-semibold text-accent border border-accent/30 px-2.5 py-1 rounded-lg hover:bg-accent/10 transition-colors"
                      >
                        Convince me
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Hot Right Now */}
      {hotProfiles.length > 0 && (
        <div className="bg-surface border border-rim rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-accent" />
            <span className="text-xs font-body font-semibold text-accent uppercase tracking-widest">
              Hot Right Now
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {hotProfiles.map((p) => {
              const tier = getTier(p.average_score)
              return (
                <div key={p.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16">
                  <div
                    className="relative w-12 h-12 rounded-full overflow-hidden border-2"
                    style={{ borderColor: TIER_COLORS[tier] }}
                  >
                    {p.photo_url ? (
                      <Image src={p.photo_url} alt={p.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full bg-rim flex items-center justify-center">
                        <span className="font-display font-bold text-sm" style={{ color: TIER_COLORS[tier] }}>
                          {p.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted font-body text-center truncate w-full">
                    {p.name}
                  </span>
                  <TierBadge score={p.average_score} size="sm" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Match flash overlay */}
      {matchFlash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6">
          <div className="bg-surface border border-[#2db896]/60 rounded-3xl px-8 py-7 text-center shadow-2xl animate-fade-in-up w-full max-w-xs pointer-events-auto">
            <Heart size={36} className="text-[#2db896] mx-auto mb-3 fill-current" />
            <div className="font-display font-bold text-2xl text-cream mb-1">It&apos;s a Match!</div>
            <div className="text-muted text-sm font-body mb-5">
              You and {matchFlash.name} liked each other
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/matches/${matchFlash.matchId}`}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2db896] text-bg font-body font-semibold text-sm hover:bg-[#2db896]/90 transition-colors"
                onClick={() => setMatchFlash(null)}
              >
                <MessageCircle size={16} />
                Start chatting
              </Link>
              <button
                onClick={() => setMatchFlash(null)}
                className="text-muted text-xs font-body py-1 hover:text-cream transition-colors"
              >
                Keep discovering
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card stack */}
      {current ? (
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative">
            <ProfileCard
              user={current}
              photos={photoMap[current.id] ?? []}
              streak={streakMap[current.id]}
              confidenceScore={confidenceMap[current.id] ?? null}
              className={cn(
                'transition-transform',
                sliding === 'left'  && 'animate-slide-left',
                sliding === 'right' && 'animate-slide-right'
              )}
            />
          </div>

          <RatingButtons
            onRate={handleRate}
            disabled={loading || remaining <= 0}
            loading={loading}
          />

          <div className="flex gap-3">
            <button
              onClick={handlePass}
              disabled={loading}
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-rim bg-surface text-muted font-body text-sm hover:border-cream/30 hover:text-cream transition-colors disabled:opacity-40"
            >
              <X size={15} />
              Pass
            </button>

            {matchedMap[current.id] ? (
              <Link
                href={`/matches/${matchedMap[current.id]}`}
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-[#2db896]/50 bg-[#2db896]/10 text-[#2db896] font-body text-sm hover:bg-[#2db896]/20 transition-colors"
              >
                <MessageCircle size={15} />
                Chat
              </Link>
            ) : (
              <button
                disabled
                title="Rate 5+ to unlock messaging"
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-rim bg-surface text-muted/40 font-body text-sm cursor-not-allowed"
              >
                <MessageCircle size={15} />
                Message
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 pb-2">
            {profiles.slice(0, Math.min(5, profiles.length)).map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all ${
                  i === currentIdx ? 'w-4 h-1.5 bg-accent'
                  : i < currentIdx  ? 'w-1.5 h-1.5 bg-rim'
                  : 'w-1.5 h-1.5 bg-muted/40'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-16">
          <div className="text-5xl">✨</div>
          <h2 className="font-display font-bold text-2xl text-cream">You&apos;re all caught up!</h2>
          <p className="text-muted font-body text-sm max-w-xs">
            No more new profiles right now. Check back later or explore the leaderboard.
          </p>
          <Link
            href="/leaderboard"
            className="px-6 py-3 rounded-xl bg-surface border border-rim text-cream font-body text-sm hover:border-accent/40 transition-colors"
          >
            View leaderboard
          </Link>
        </div>
      )}

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {/* Convince me modal — B sends message to A (the rater) */}
      {convinceTarget && (
        <ConvinceMeModal
          nearMatchId={convinceTarget.id}
          recipient={convinceTarget.rater}
          onClose={() => setConvinceTarget(null)}
          onSent={() => {
            setSentConvinceMe((s) => new Set([...s, convinceTarget.id]))
            setConvinceTarget(null)
          }}
        />
      )}
    </div>
  )
}
