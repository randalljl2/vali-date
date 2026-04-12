'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadOnboardingPhoto, deleteOnboardingPhoto } from '@/lib/actions'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OnboardingPhoto = { url: string; path: string }

interface Props {
  onChange: (photos: OnboardingPhoto[]) => void
}

export function OnboardingPhotoGrid({ onChange }: Props) {
  const [photos, setPhotos] = useState<OnboardingPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function commit(next: OnboardingPhoto[]) {
    setPhotos(next)
    onChange(next)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 10) return

    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('photo', file)
    const result = await uploadOnboardingPhoto(formData)

    if ('error' in result) {
      setError(result.error)
    } else {
      commit([...photos, { url: result.url, path: result.path }])
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(idx: number) {
    setDeletingIdx(idx)
    // Best-effort storage cleanup — non-blocking, non-critical
    deleteOnboardingPhoto(photos[idx].path)
    commit(photos.filter((_, i) => i !== idx))
    setDeletingIdx(null)
  }

  function move(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= photos.length) return
    const next = [...photos]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    commit(next)
  }

  const canAdd = photos.length < 10

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-accent bg-accent/10 border border-accent/30 rounded-xl px-3 py-2.5 font-body">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, idx) => {
          const isPrimary = idx === 0
          const isDeleting = deletingIdx === idx

          return (
            <div
              key={photo.path}
              className={cn(
                'relative aspect-square rounded-xl overflow-hidden bg-rim group',
                isDeleting && 'opacity-40'
              )}
            >
              <Image
                src={photo.url}
                alt={`Photo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 150px"
              />

              {isPrimary && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-accent/90 backdrop-blur-sm text-[9px] text-white font-body font-semibold uppercase tracking-wider pointer-events-none">
                  Primary
                </div>
              )}

              {/* Controls — visible on hover */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-1.5">
                <button
                  onClick={() => handleDelete(idx)}
                  disabled={isDeleting}
                  className="self-end w-6 h-6 rounded-full bg-black/50 hover:bg-accent/80 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={11} className="text-white" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-full bg-black/50 hover:bg-white/20 transition-colors flex items-center justify-center disabled:opacity-25"
                  >
                    <ChevronLeft size={14} className="text-white" />
                  </button>
                  <span className="text-white/60 text-xs font-body tabular-nums">
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === photos.length - 1}
                    className="w-7 h-7 rounded-full bg-black/50 hover:bg-white/20 transition-colors flex items-center justify-center disabled:opacity-25"
                  >
                    <ChevronRight size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add-photo slot */}
        {canAdd && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={cn(
              'aspect-square rounded-xl border-2 border-dashed border-rim',
              'hover:border-accent/50 hover:bg-accent/5 transition-colors',
              'flex flex-col items-center justify-center gap-1.5 text-muted hover:text-cream',
              uploading && 'opacity-50 cursor-wait'
            )}
          >
            {uploading ? (
              <span className="text-xs font-body animate-pulse text-center px-1">
                Uploading…
              </span>
            ) : (
              <>
                <Plus size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-body leading-none">
                  {10 - photos.length} left
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted font-body">
        {photos.length > 0
          ? `${photos.length} / 10 · Hover to reorder or delete · First photo is primary`
          : 'Up to 10 photos · First photo is your primary'}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
