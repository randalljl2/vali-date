'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { UserPhoto } from '@/types'

interface Props {
  photos: UserPhoto[]
  /** Fallback when user_photos table is empty but legacy photo_url exists */
  fallbackUrl?: string | null
  name: string
  height?: string
}

export function PhotoCarousel({ photos, fallbackUrl, name, height = 'h-72' }: Props) {
  const [idx, setIdx] = useState(0)

  // Prefer the user_photos array; fall back to legacy photo_url
  const srcs: string[] =
    photos.length > 0
      ? photos.map((p) => p.url)
      : fallbackUrl
      ? [fallbackUrl]
      : []

  if (srcs.length === 0) return null

  const current = srcs[Math.min(idx, srcs.length - 1)]

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    if (srcs.length <= 1) return
    const { clientX, currentTarget } = e
    const mid = currentTarget.getBoundingClientRect().left + currentTarget.offsetWidth / 2
    setIdx((i) => (clientX < mid ? Math.max(0, i - 1) : Math.min(srcs.length - 1, i + 1)))
  }

  return (
    <div className={`relative w-full ${height} cursor-pointer select-none`} onClick={handleTap}>
      <Image
        key={current}
        src={current}
        alt={`${name}'s photo`}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 480px"
        priority={idx === 0}
      />

      {/* Photo count dots */}
      {srcs.length > 1 && (
        <div className="absolute top-2.5 left-0 right-0 flex justify-center gap-1 pointer-events-none">
          {srcs.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === idx ? 'w-4 h-1 bg-white' : 'w-1 h-1 bg-white/45'
              }`}
            />
          ))}
        </div>
      )}

      {/* Subtle edge tap hints when more photos exist */}
      {srcs.length > 1 && (
        <>
          {idx > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-start pl-2 pointer-events-none">
              <span className="text-white/50 text-lg leading-none">‹</span>
            </div>
          )}
          {idx < srcs.length - 1 && (
            <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-end pr-2 pointer-events-none">
              <span className="text-white/50 text-lg leading-none">›</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
