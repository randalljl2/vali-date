'use client'

import { cmToImperial } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number | null
  onChange: (cm: number | null) => void
}

const MIN_CM = 140
const MAX_CM = 220
const DEFAULT_CM = 170

export function HeightPicker({ value, onChange }: Props) {
  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => onChange(DEFAULT_CM)}
        className="w-full px-4 py-3 rounded-xl border border-dashed border-border bg-surface text-muted font-body text-sm hover:border-accent/40 hover:text-ink-2 transition-colors text-center"
      >
        + Add height
      </button>
    )
  }

  const { feet, inches } = cmToImperial(value)

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => onChange(Math.max(MIN_CM, value - 1))}
        disabled={value <= MIN_CM}
        className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-ink hover:border-ink-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Minus size={14} />
      </button>

      <div className="flex-1 text-center">
        <div className="font-display font-bold text-2xl text-ink leading-none">
          {feet}&apos;{inches}&quot;
        </div>
        <div className="text-xs text-muted font-body mt-1">{value} cm</div>
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(MAX_CM, value + 1))}
        disabled={value >= MAX_CM}
        className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-ink hover:border-ink-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Plus size={14} />
      </button>

      <button
        type="button"
        onClick={() => onChange(null)}
        className="text-xs text-muted/50 font-body hover:text-muted transition-colors flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}
