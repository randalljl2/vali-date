import { cn, getStreakPerk } from '@/lib/utils'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md'
  className?: string
}

export function StreakBadge({ streak, size = 'md', className }: StreakBadgeProps) {
  const perk = getStreakPerk(streak)
  const isBoosted = streak >= 7

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-body font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        isBoosted
          ? 'border border-[#e8c46a]/50 bg-[#e8c46a]/10 text-[#e8c46a]'
          : 'border border-rim bg-surface text-muted',
        className
      )}
      title={perk ?? undefined}
    >
      <span>{streak >= 7 ? '🔥' : '▸'}</span>
      <span>{streak}d streak</span>
      {isBoosted && <span className="opacity-60 text-[10px] ml-0.5">★</span>}
    </span>
  )
}
