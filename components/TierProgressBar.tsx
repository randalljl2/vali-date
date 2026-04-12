import { getTier, getTierProgress, getPointsToNextTier, getNextTier, TIER_COLORS } from '@/lib/utils'

interface TierProgressBarProps {
  score: number
}

export function TierProgressBar({ score }: TierProgressBarProps) {
  const tier = getTier(score)
  const progress = getTierProgress(score)
  const nextTier = getNextTier(tier)
  const pointsLeft = getPointsToNextTier(score)
  const color = TIER_COLORS[tier]

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium" style={{ color }}>
          {tier}
        </span>
        {nextTier ? (
          <span className="text-xs text-muted">
            {pointsLeft} pts to{' '}
            <span style={{ color: TIER_COLORS[nextTier] }}>{nextTier}</span>
          </span>

        ) : (
          <span className="text-xs text-[#e8c46a]">Max tier reached ✦</span>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-rim overflow-hidden">
        <div
          className="progress-fill h-full"
          style={{ width: `${nextTier ? progress : 100}%` }}
        />
      </div>
    </div>
  )
}
