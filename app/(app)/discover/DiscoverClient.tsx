'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { expressInterest, passProfile, rateAttraction } from '@/lib/actions'
import { formatHeight } from '@/lib/utils'
import { HERE_FOR_LABELS } from '@/types'
import type { DiscoverProfile } from '@/types'

interface Props {
  initialProfiles: DiscoverProfile[]
  userId: string
}

function CompatibilityDisplay({ score }: { score: number | null }) {
  if (score === null) return (
    <div className="text-center">
      <p className="font-display font-bold text-3xl text-muted leading-none">—</p>
      <p className="text-[9px] uppercase tracking-widest text-muted font-body mt-0.5">Loading</p>
    </div>
  )
  const color = score >= 80 ? '#2a7d5f' : score >= 60 ? '#5a6e3a' : score >= 40 ? '#8a6e2a' : '#7a2535'
  return (
    <div className="text-center">
      <p className="font-display font-black leading-none" style={{ fontSize: '2.5rem', color }}>{score}%</p>
      <p className="text-[9px] uppercase tracking-widest font-body mt-0.5" style={{ color }}>Compatible</p>
    </div>
  )
}

function ProfileCard({ profile }: { profile: DiscoverProfile }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showRater, setShowRater] = useState(false)
  const [ratingVal, setRatingVal] = useState(5)
  const [rated, setRated] = useState(false)

  const photos = profile.photos
  const primaryPhoto = photos[photoIdx]?.url ?? profile.photo_url

  async function submitRating() {
    await rateAttraction(profile.id, ratingVal)
    setRated(true)
    setShowRater(false)
  }

  return (
    <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
      {/* Photo */}
      <div className="relative bg-border-soft" style={{ aspectRatio: '4/5' }}>
        {primaryPhoto ? (
          <Image src={primaryPhoto} alt={profile.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-black text-7xl text-muted">{profile.name[0]}</span>
          </div>
        )}

        {/* Photo strip */}
        {photos.length > 1 && (
          <div className="absolute top-3 inset-x-3 flex gap-1">
            {photos.map((_, i) => (
              <div key={i} className={`flex-1 h-0.5 rounded-full ${i === photoIdx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
        {photos.length > 1 && photoIdx > 0 && (
          <button onClick={() => setPhotoIdx(i => i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
            <ChevronLeft size={16} />
          </button>
        )}
        {photos.length > 1 && photoIdx < photos.length - 1 && (
          <button onClick={() => setPhotoIdx(i => i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white">
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Name + compat */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-2xl text-ink leading-tight">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-muted font-body text-sm mt-0.5">{profile.city}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.height_cm && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-border-soft bg-bg text-muted font-body">
                  {formatHeight(profile.height_cm)}
                </span>
              )}
              <span className="text-xs px-2.5 py-1 rounded-full border border-border-soft bg-bg text-muted font-body">
                {HERE_FOR_LABELS[profile.here_for]}
              </span>
              {profile.confidenceToday !== null && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-border-soft bg-bg text-muted font-body">
                  Confidence {profile.confidenceToday}/10
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <CompatibilityDisplay score={profile.compatibilityScore} />
            {profile.sharedAnswers > 0 && (
              <p className="text-[9px] text-muted font-body text-center mt-1">
                {profile.sharedAnswers} shared q&apos;s
              </p>
            )}
          </div>
        </div>

        {/* Prompts */}
        {(profile.prompt_1_question && profile.prompt_1_answer) ||
         (profile.prompt_2_question && profile.prompt_2_answer) ? (
          <div className="space-y-2">
            {profile.prompt_1_question && profile.prompt_1_answer && (
              <div className="bg-bg rounded-xl px-4 py-3 space-y-1 border border-border-soft">
                <p className="text-xs text-muted font-body">{profile.prompt_1_question}</p>
                <p className="text-sm text-ink-2 font-serif italic leading-snug">{profile.prompt_1_answer}</p>
              </div>
            )}
            {profile.prompt_2_question && profile.prompt_2_answer && (
              <div className="bg-bg rounded-xl px-4 py-3 space-y-1 border border-border-soft">
                <p className="text-xs text-muted font-body">{profile.prompt_2_question}</p>
                <p className="text-sm text-ink-2 font-serif italic leading-snug">{profile.prompt_2_answer}</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1">
          <Link href={`/profile/${profile.id}`}
            className="text-xs text-muted font-body hover:text-ink-2 transition-colors">
            View profile →
          </Link>

          {/* Silent attraction rating */}
          {!rated ? (
            showRater ? (
              <div className="flex items-center gap-2">
                <input type="range" min={1} max={10} step={1} value={ratingVal}
                  onChange={e => setRatingVal(parseInt(e.target.value))}
                  className="w-20" />
                <span className="text-xs text-muted font-body w-4">{ratingVal}</span>
                <button onClick={submitRating}
                  className="text-xs font-body text-muted border border-border rounded-lg px-2 py-1 hover:text-ink-2 transition-colors">
                  <Star size={10} className="inline mr-0.5" />Done
                </button>
                <button onClick={() => setShowRater(false)} className="text-xs text-muted font-body">✕</button>
              </div>
            ) : (
              <button onClick={() => setShowRater(true)}
                className="text-xs text-muted/60 font-body hover:text-muted transition-colors">
                Rate
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function DiscoverClient({ initialProfiles, userId }: Props) {
  const [profiles] = useState<DiscoverProfile[]>(initialProfiles)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [pending, setPending] = useState(false)
  const [animClass, setAnimClass] = useState('')
  const [toast, setToast] = useState<{ msg: string; variant: 'match' | 'info' | 'warn' } | null>(null)

  const current = profiles[currentIdx]

  function showToast(msg: string, variant: 'match' | 'info' | 'warn') {
    setToast({ msg, variant })
    setTimeout(() => setToast(null), 5000)
  }

  function advance() {
    setAnimClass('')
    setCurrentIdx(i => i + 1)
    setPending(false)
  }

  async function handlePass() {
    if (pending || !current) return
    setPending(true)
    setAnimClass('animate-slide-left')
    await passProfile(current.id)
    setTimeout(advance, 320)
  }

  async function handleLike() {
    if (pending || !current) return
    setPending(true)
    setAnimClass('animate-slide-right')
    const result = await expressInterest(current.id)

    setTimeout(() => {
      advance()
      if ('error' in result) { showToast(result.error, 'warn'); return }
      if (result.status === 'matched') {
        showToast(`You matched with ${current.name}! (${result.score}% compatible)`, 'match')
      } else if (result.status === 'mutual_low_compatibility') {
        showToast(
          `${current.name} is interested too, but compatibility is ${result.score}% — below 60%. Answer more questions to close the gap.`,
          'info'
        )
      } else if (result.status === 'mutual_low_answers') {
        showToast(
          `${current.name} is interested too. Answer at least 10 questions in common to unlock compatibility.`,
          'info'
        )
      }
    }, 320)
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-border-soft flex items-center justify-center">
          <span className="text-3xl">✦</span>
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-ink mb-2">You&apos;re all caught up</h2>
          <p className="text-muted font-body text-sm leading-relaxed max-w-xs">
            No more profiles right now. Answer more questions to improve your matches, or check back later.
          </p>
        </div>
        <Link href="/questions"
          className="px-6 py-3 rounded-xl bg-accent text-white font-body font-medium text-sm hover:bg-accent-soft transition-colors">
          Answer more questions
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-8 max-w-lg mx-auto relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-4 right-4 max-w-sm mx-auto z-50 px-4 py-3 rounded-2xl shadow-lg text-sm font-body animate-scale-in ${
          toast.variant === 'match' ? 'bg-accent text-white'
          : toast.variant === 'warn' ? 'bg-surface border border-accent/30 text-accent'
          : 'bg-surface border border-border text-ink-2'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Next card peek */}
      {currentIdx + 1 < profiles.length && (
        <div className="absolute inset-x-5 top-8 rounded-3xl border border-border bg-surface" aria-hidden
          style={{ height: 60, transform: 'scale(0.96) translateY(10px)', zIndex: 0, opacity: 0.4 }} />
      )}

      {/* Current card */}
      <div className={`relative z-10 ${animClass}`} key={current.id}>
        <ProfileCard profile={current} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-10 mt-6">
        <button
          onClick={handlePass}
          disabled={pending}
          aria-label="Pass"
          className="w-16 h-16 rounded-full bg-surface border-2 border-border shadow-sm flex items-center justify-center text-muted hover:border-ink-2 hover:text-ink-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <X size={24} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleLike}
          disabled={pending}
          aria-label="Express interest"
          className="w-20 h-20 rounded-full bg-accent shadow-md flex items-center justify-center text-white hover:bg-accent-soft transition-all active:scale-95 disabled:opacity-50"
        >
          <Heart size={28} fill="currentColor" />
        </button>
      </div>

      <p className="text-center text-xs text-muted font-body mt-4">
        {currentIdx + 1} of {profiles.length}
      </p>
    </div>
  )
}
