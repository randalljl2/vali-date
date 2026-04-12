'use client'

import { useState } from 'react'
import { getRatingColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface RatingButtonsProps {
  onRate: (score: number) => void
  disabled?: boolean
  loading?: boolean
}

export function RatingButtons({ onRate, disabled, loading }: RatingButtonsProps) {
  const [hoveredScore, setHoveredScore] = useState<number | null>(null)
  const [selectedScore, setSelectedScore] = useState<number | null>(null)

  function handleRate(score: number) {
    if (disabled || loading) return
    setSelectedScore(score)
    onRate(score)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-muted">Not for me</span>
        <span className="text-xs text-muted">Iconic</span>
      </div>
      <div className="flex gap-1.5 justify-between">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
          const color = getRatingColor(score)
          const isHovered = hoveredScore !== null && score <= hoveredScore
          const isSelected = selectedScore === score

          return (
            <button
              key={score}
              onClick={() => handleRate(score)}
              onMouseEnter={() => setHoveredScore(score)}
              onMouseLeave={() => setHoveredScore(null)}
              disabled={disabled || loading}
              className={cn(
                'rating-btn flex-1 rounded-lg font-body font-bold text-sm',
                'border transition-all duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                isSelected ? 'scale-110' : ''
              )}
              style={{
                height: 44,
                borderColor: isHovered || isSelected ? color : `${color}40`,
                backgroundColor: isHovered || isSelected ? `${color}25` : `${color}10`,
                color: isHovered || isSelected ? color : `${color}90`,
                boxShadow: isSelected ? `0 0 12px ${color}50` : undefined,
              }}
            >
              {score}
            </button>
          )
        })}
      </div>
      {loading && (
        <div className="text-center text-xs text-muted animate-pulse">Rating…</div>
      )}
    </div>
  )
}
