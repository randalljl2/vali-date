import { MapPin } from 'lucide-react'
import { TierBadge } from './TierBadge'
import { StreakBadge } from './StreakBadge'
import { PhotoCarousel } from './PhotoCarousel'
import { getTier, TIER_COLORS, getRatingColor, displayScore, formatHeight } from '@/lib/utils'
import { HERE_FOR_LABELS } from '@/types'
import type { UserProfile, UserPhoto, Streak } from '@/types'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  user: UserProfile
  photos?: UserPhoto[]
  streak?: Streak | null
  confidenceScore?: number | null
  className?: string
  compact?: boolean
}

export function ProfileCard({ user, photos = [], streak, confidenceScore, className, compact }: ProfileCardProps) {
  const tier = getTier(user.average_score)
  const isIconic = tier === 'Iconic'
  const hasPhoto = photos.length > 0 || !!user.photo_url

  return (
    <div
      className={cn(
        'relative rounded-2xl bg-surface border overflow-hidden',
        isIconic ? 'iconic-border' : 'border-rim',
        className
      )}
    >
      {/* Photo / carousel area */}
      <div className={cn('relative w-full bg-rim', compact ? 'h-48' : 'h-72')}>
        {hasPhoto ? (
          <PhotoCarousel
            photos={photos}
            fallbackUrl={user.photo_url}
            name={user.name}
            height={compact ? 'h-48' : 'h-72'}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-display font-bold text-6xl opacity-30"
              style={{ color: TIER_COLORS[tier] }}
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent pointer-events-none" />

        {/* Tier badge — top right */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <TierBadge score={user.average_score} size="sm" />
        </div>

        {/* Streak badge — top left */}
        {streak && streak.current_streak > 0 && (
          <div className={cn('absolute left-3 pointer-events-none', photos.length > 1 ? 'top-7' : 'top-3')}>
            <StreakBadge streak={streak.current_streak} size="sm" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Name / age / city + avg score */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-cream leading-tight">
              {user.name}, <span className="font-normal">{user.age}</span>
            </h3>
            <div className="flex items-center gap-1.5 text-muted text-sm mt-0.5 flex-wrap">
              <MapPin size={12} className="flex-shrink-0" />
              <span>{user.city}</span>
              {user.height_cm && (
                <>
                  <span className="text-muted/40">·</span>
                  <span>{formatHeight(user.height_cm)}</span>
                </>
              )}
            </div>
          </div>

          {user.rating_count > 0 && (
            <div className="text-right">
              <div
                className="font-display font-bold text-2xl leading-none"
                style={{ color: TIER_COLORS[tier] }}
              >
                {displayScore(user.average_score)}
              </div>
              <div className="text-muted text-xs mt-0.5">
                {user.rating_count} {user.rating_count === 1 ? 'rating' : 'ratings'}
              </div>
            </div>
          )}
        </div>

        {!compact && (
          <>
            {/* Here for */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Here for</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-rim text-cream/70">
                {HERE_FOR_LABELS[user.here_for]}
              </span>
            </div>

            {/* Confidence meter */}
            {confidenceScore != null && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Confidence today</span>
                  <span
                    className="text-xs font-body font-semibold tabular-nums"
                    style={{ color: getRatingColor(confidenceScore) }}
                  >
                    {confidenceScore}/10
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-rim overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${confidenceScore * 10}%`,
                      backgroundColor: getRatingColor(confidenceScore),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-muted/80 font-body leading-relaxed line-clamp-3">
                {user.bio}
              </p>
            )}

            {/* Prompts */}
            {(user.prompt_1_question || user.prompt_2_question) && (
              <div className="space-y-2 pt-1">
                {user.prompt_1_question && user.prompt_1_answer && (
                  <div className="bg-bg rounded-xl px-3 py-2.5 space-y-1">
                    <p className="text-xs text-muted font-body leading-snug">
                      {user.prompt_1_question}
                    </p>
                    <p className="text-sm text-cream font-body leading-snug line-clamp-3">
                      {user.prompt_1_answer}
                    </p>
                  </div>
                )}
                {user.prompt_2_question && user.prompt_2_answer && (
                  <div className="bg-bg rounded-xl px-3 py-2.5 space-y-1">
                    <p className="text-xs text-muted font-body leading-snug">
                      {user.prompt_2_question}
                    </p>
                    <p className="text-sm text-cream font-body leading-snug line-clamp-3">
                      {user.prompt_2_answer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
