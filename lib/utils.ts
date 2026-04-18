import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Height formatting — stored as cm, displayed as ft'in" / Xcm
export function cmToImperial(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  let inches = Math.round(totalInches % 12)
  if (inches === 12) return { feet: feet + 1, inches: 0 }
  return { feet, inches }
}

export function formatHeight(cm: number): string {
  const { feet, inches } = cmToImperial(cm)
  return `${feet}'${inches}"`
}

export function formatHeightFull(cm: number): string {
  const { feet, inches } = cmToImperial(cm)
  return `${feet}'${inches}" / ${cm}cm`
}

// Compatibility score formatting
export function formatCompatibility(score: number | null): string {
  if (score === null) return '—'
  return `${Math.round(score)}%`
}

// Compatibility colour — deeper green = better match
export function compatibilityColor(score: number | null): string {
  if (score === null) return '#8a7b6a'
  if (score >= 80) return '#2a7d5f'
  if (score >= 60) return '#5a6e3a'
  if (score >= 40) return '#8a7b2a'
  return '#7a2535'
}

export type SubscriptionTier = 'free' | 'plus' | 'premium'

export function isPaid(tier: SubscriptionTier): boolean {
  return tier === 'plus' || tier === 'premium'
}
