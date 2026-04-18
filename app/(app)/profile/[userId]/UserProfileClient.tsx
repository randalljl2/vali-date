'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { formatHeight } from '@/lib/utils'
import { HERE_FOR_LABELS } from '@/types'
import type { UserProfile, UserPhoto } from '@/types'

interface Props {
  profile: UserProfile
  photos: UserPhoto[]
  confidenceToday: number | null
  compatibilityScore: number | null
}

export function UserProfileClient({ profile, photos, confidenceToday, compatibilityScore }: Props) {
  const primaryPhoto = photos[0]?.url ?? profile.photo_url

  return (
    <div className="flex flex-col min-h-screen pb-6 bg-bg">
      {/* Hero */}
      <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ aspectRatio: '4/5', maxHeight: '60vh' }}>
        {primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryPhoto}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-border-soft flex items-center justify-center">
            <span className="font-display font-black text-7xl text-muted">{profile.name[0]}</span>
          </div>
        )}

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #f5f0e8 0%, transparent 100%)' }}
        />

        {/* Back button */}
        <Link
          href="/matches"
          className="absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-full border border-white/30 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>

        {/* Name overlay */}
        <div className="absolute bottom-5 left-4 right-4">
          <h1 className="font-display font-bold text-3xl text-ink leading-tight drop-shadow-sm">
            {profile.name}, {profile.age}
          </h1>
          <div className="flex items-center gap-1.5 text-ink/60 text-sm mt-1 flex-wrap">
            <MapPin size={12} className="flex-shrink-0" />
            <span className="font-body">{profile.city}</span>
            {profile.height_cm && (
              <>
                <span className="text-ink/30">·</span>
                <span className="font-body">{formatHeight(profile.height_cm)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick tags */}
      <div className="px-4 pt-4 flex flex-wrap gap-2">
        <span className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-ink-2 font-body">
          {HERE_FOR_LABELS[profile.here_for]}
        </span>
        {profile.height_cm && (
          <span className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-ink-2 font-body">
            {formatHeight(profile.height_cm)}
          </span>
        )}
        {confidenceToday !== null && (
          <span className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-ink-2 font-body">
            Confidence {confidenceToday}/10 today
          </span>
        )}
      </div>

      {/* Compatibility */}
      {compatibilityScore !== null && (
        <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-body font-semibold text-ink text-sm">Compatibility</p>
            <p className="text-xs text-muted font-body mt-0.5">Based on your shared answers</p>
          </div>
          <div className="text-right">
            <p
              className="font-display font-black text-3xl leading-none"
              style={{
                color: compatibilityScore >= 80 ? '#2a7d5f'
                  : compatibilityScore >= 60 ? '#5a6e3a'
                  : compatibilityScore >= 40 ? '#8a6e2a'
                  : '#7a2535'
              }}
            >
              {compatibilityScore}%
            </p>
          </div>
        </div>
      )}

      {/* Photos grid */}
      {photos.length > 1 && (
        <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
          <h3 className="font-body font-semibold text-ink text-sm mb-4">Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-border-soft"
              >
                <Image
                  src={photo.url}
                  alt={`${profile.name} photo ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 150px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompts */}
      {((profile.prompt_1_question && profile.prompt_1_answer) ||
        (profile.prompt_2_question && profile.prompt_2_answer)) && (
        <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
          <h3 className="font-body font-semibold text-ink text-sm mb-4">Prompts</h3>
          <div className="space-y-3">
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
        </div>
      )}
    </div>
  )
}
