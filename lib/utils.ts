import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Tier } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tier calculation — score is stored as 0–100 (avg rating × 10).
// Display scale is 0.0–10.0; use displayScore() for all UI output.
export function getTier(score: number): Tier {
  if (score >= 90) return 'Iconic'
  if (score >= 80) return 'Certified'
  if (score >= 70) return 'Validated'
  if (score >= 50) return 'Rising'
  return 'Newcomer'
}

export const TIER_COLORS: Record<Tier, string> = {
  Newcomer: '#4a3a42',
  Rising: '#7a6068',
  Validated: '#a0a8b0',
  Certified: '#c8293a',
  Iconic: '#e8c46a',
}

// Internal 0–100 ranges matching display tiers: Newcomer 0–4.9, Rising 5–6.9,
// Validated 7–7.9, Certified 8–8.9, Iconic 9–10
export const TIER_RANGES: Record<Tier, [number, number]> = {
  Newcomer:  [0,  49],
  Rising:    [50, 69],
  Validated: [70, 79],
  Certified: [80, 89],
  Iconic:    [90, 100],
}

export function getTierProgress(score: number): number {
  const tier = getTier(score)
  const [min, max] = TIER_RANGES[tier]
  return Math.round(((score - min) / (max - min)) * 100)
}

export function getNextTier(tier: Tier): Tier | null {
  const order: Tier[] = ['Newcomer', 'Rising', 'Validated', 'Certified', 'Iconic']
  const idx = order.indexOf(tier)
  return idx < order.length - 1 ? order[idx + 1] : null
}

// Returns the gap to the next tier in display scale (0.0–10.0), e.g. 0.5
export function getPointsToNextTier(score: number): number | null {
  const tier = getTier(score)
  const next = getNextTier(tier)
  if (!next) return null
  return parseFloat(((TIER_RANGES[next][0] - score) / 10).toFixed(1))
}

// Convert stored 0–100 score to the 1.0–10.0 display string
export function displayScore(score: number): string {
  return (score / 10).toFixed(1)
}

// Rating colors: 1 = red (#c8293a) → 10 = teal-green (#2db896)
export const RATING_COLORS = [
  '#c8293a', // 1
  '#d0391e', // 2
  '#e06030', // 3
  '#e07820', // 4
  '#c9a84c', // 5
  '#a8b83a', // 6
  '#7ab83d', // 7
  '#4db850', // 8
  '#2db876', // 9
  '#2db896', // 10
]

export function getRatingColor(rating: number): string {
  return RATING_COLORS[Math.max(0, Math.min(9, rating - 1))]
}

export function formatScore(score: number): string {
  return displayScore(score)
}

// Streak perks
export function getStreakPerk(streak: number): string | null {
  if (streak >= 30) return 'Iconic border effect'
  if (streak >= 14) return 'Priority in discover feed'
  if (streak >= 7) return 'Boosted badge'
  if (streak >= 3) return 'Shown to 10% more people'
  return null
}

export function getNextStreakPerk(streak: number): { days: number; perk: string } | null {
  if (streak < 3) return { days: 3, perk: 'Shown to 10% more people' }
  if (streak < 7) return { days: 7, perk: 'Boosted badge' }
  if (streak < 14) return { days: 14, perk: 'Priority in discover feed' }
  if (streak < 30) return { days: 30, perk: 'Iconic border effect' }
  return null
}
