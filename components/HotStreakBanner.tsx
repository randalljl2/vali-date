'use client'

import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { activateHotStreakBoost } from '@/lib/actions'

interface Props {
  /** ISO string — when the boost was activated (null = not active yet) */
  activatedAt: string | null
  /** Whether the user activated the boost this week but it expired */
  usedThisWeek: boolean
}

function msToCountdown(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function HotStreakBanner({ activatedAt, usedThisWeek }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [boostActive, setBoostActive] = useState(false)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activatedAt) { setBoostActive(false); return }

    const expiresAt = new Date(activatedAt).getTime() + 60 * 60 * 1000

    function tick() {
      const remaining = expiresAt - Date.now()
      if (remaining > 0) {
        setBoostActive(true)
        setTimeLeft(remaining)
      } else {
        setBoostActive(false)
        setTimeLeft(0)
      }
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activatedAt])

  async function handleActivate() {
    setActivating(true)
    setError(null)
    const result = await activateHotStreakBoost()
    setActivating(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    // Timer will start via prop update (page revalidation)
  }

  if (boostActive) {
    return (
      <div className="mx-4 mt-4 rounded-2xl border border-[#9b6dff]/50 bg-[#9b6dff]/10 p-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#9b6dff]" />
            <span className="text-sm font-body font-semibold text-[#9b6dff]">Hot Streak Active</span>
          </div>
          <span className="font-display font-bold text-[#9b6dff] text-sm tabular-nums">
            {msToCountdown(timeLeft)}
          </span>
        </div>
        <p className="text-xs text-muted font-body">
          You&apos;re being shown to more people right now.
        </p>
      </div>
    )
  }

  if (usedThisWeek) {
    return (
      <div className="mx-4 mt-4 rounded-2xl border border-rim bg-surface p-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-muted" />
          <span className="text-sm font-body font-semibold text-muted">Hot Streak Boost</span>
        </div>
        <p className="text-xs text-muted font-body mt-1">
          Boost used this week. Available again next week.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-[#9b6dff]/30 bg-[#9b6dff]/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-[#9b6dff]" />
        <span className="text-sm font-body font-semibold text-[#9b6dff]">Hot Streak Boost</span>
        <span className="text-xs text-muted font-body ml-auto">Premium perk</span>
      </div>
      <p className="text-xs text-muted font-body">
        Get shown to significantly more people for 60 minutes. Available once per week.
      </p>
      {error && <p className="text-xs text-accent font-body">{error}</p>}
      <button
        onClick={handleActivate}
        disabled={activating}
        className="w-full py-2.5 rounded-xl bg-[#9b6dff] text-white text-sm font-body font-semibold hover:bg-[#9b6dff]/90 transition-colors disabled:opacity-60"
      >
        {activating ? 'Activating…' : 'Activate boost'}
      </button>
    </div>
  )
}
