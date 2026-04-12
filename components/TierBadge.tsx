import { getTier, TIER_COLORS, displayScore } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TierBadgeProps {
  score: number
  showScore?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function TierBadge({ score, showScore = false, size = 'md', className }: TierBadgeProps) {
  const tier = getTier(score)
  const color = TIER_COLORS[tier]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-body font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}18`,
      }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{
          width: size === 'sm' ? 6 : 8,
          height: size === 'sm' ? 6 : 8,
          backgroundColor: color,
        }}
      />
      {tier}
      {showScore && (
        <span className="opacity-70 ml-0.5">{displayScore(score)}</span>
      )}
    </span>
  )
}
