'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TierBadge } from '@/components/TierBadge'
import { StreakBadge } from '@/components/StreakBadge'
import { getTier, TIER_COLORS, displayScore } from '@/lib/utils'
import type { UserProfile, Streak, Tier } from '@/types'
import { Trophy, Crown } from 'lucide-react'

const TIER_FILTERS: Array<Tier | 'All'> = ['All', 'Iconic', 'Certified', 'Validated', 'Rising', 'Newcomer']

interface Props {
  profiles: UserProfile[]
  streakMap: Record<string, Streak>
  currentUserId: string
}

export function LeaderboardClient({ profiles, streakMap, currentUserId }: Props) {
  const [filter, setFilter] = useState<Tier | 'All'>('All')

  const filtered = filter === 'All'
    ? profiles
    : profiles.filter((p) => getTier(p.average_score) === filter)

  const myRank = profiles.findIndex((p) => p.id === currentUserId) + 1

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-cream flex items-center gap-2">
          <Trophy size={22} className="text-[#e8c46a]" />
          Leaderboard
        </h1>
        {myRank > 0 && (
          <span className="text-xs text-muted font-body px-3 py-1.5 rounded-full border border-rim">
            You: #{myRank}
          </span>
        )}
      </div>

      {/* Tier filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TIER_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-all ${
              filter === t
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-rim bg-surface text-muted hover:text-cream'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {filter === 'All' && filtered.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {[filtered[1], filtered[0], filtered[2]].map((p, podiumIdx) => {
            const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3
            const tier = getTier(p.average_score)
            const heights = ['h-24', 'h-32', 'h-20']
            const isFirst = rank === 1

            return (
              <div key={p.id} className="flex flex-col items-center gap-2 flex-1 max-w-[100px]">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden border-2 mx-auto"
                    style={{ borderColor: TIER_COLORS[tier] }}
                  >
                    {p.photo_url ? (
                      <Image src={p.photo_url} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-rim flex items-center justify-center">
                        <span className="font-display font-bold text-sm" style={{ color: TIER_COLORS[tier] }}>
                          {p.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  {isFirst && (
                    <Crown size={14} className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#e8c46a]" />
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs font-body font-semibold text-cream truncate">{p.name}</div>
                  <div className="text-xs font-display font-bold" style={{ color: TIER_COLORS[tier] }}>
                    {displayScore(p.average_score)}
                  </div>
                </div>
                <div
                  className={`w-full rounded-t-lg ${heights[podiumIdx]} flex items-start justify-center pt-2`}
                  style={{ backgroundColor: `${TIER_COLORS[tier]}20`, borderTop: `2px solid ${TIER_COLORS[tier]}40` }}
                >
                  <span className="text-sm font-display font-bold" style={{ color: TIER_COLORS[tier] }}>
                    #{rank}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rankings list */}
      <div className="space-y-2 pb-4">
        {filtered.map((profile, idx) => {
          const rank = profiles.indexOf(profile) + 1
          const tier = getTier(profile.average_score)
          const streak = streakMap[profile.id]
          const isMe = profile.id === currentUserId

          return (
            <div
              key={profile.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                isMe
                  ? 'border-accent/40 bg-accent/10'
                  : 'border-rim bg-surface hover:border-rim/60'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {rank <= 3 ? (
                  <span className="text-lg">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-xs text-muted font-body font-medium">#{rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border"
                style={{ borderColor: `${TIER_COLORS[tier]}60` }}
              >
                {profile.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-rim flex items-center justify-center">
                    <span className="font-display font-bold text-sm" style={{ color: TIER_COLORS[tier] }}>
                      {profile.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body font-semibold text-sm text-cream truncate">
                    {profile.name}
                    {isMe && <span className="text-accent ml-1">(you)</span>}
                  </span>
                  {streak && streak.current_streak >= 7 && (
                    <span className="text-xs">🔥</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <TierBadge score={profile.average_score} size="sm" />
                  {streak && streak.current_streak > 0 && (
                    <StreakBadge streak={streak.current_streak} size="sm" />
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <div className="font-display font-bold text-lg" style={{ color: TIER_COLORS[tier] }}>
                  {displayScore(profile.average_score)}
                </div>
                <div className="text-xs text-muted">
                  {profile.rating_count} ratings
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted font-body text-sm">
            No profiles in this tier yet.
          </div>
        )}
      </div>
    </div>
  )
}
