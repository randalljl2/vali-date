'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadUserPhoto, deleteUserPhoto, reorderUserPhotos } from '@/lib/actions'
import type { UserPhoto } from '@/types'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  initialPhotos: UserPhoto[]
}

export function PhotoGrid({ initialPhotos }: Props) {
  const [photos, setPhotos] = useState<UserPhoto[]>(
    [...initialPhotos].sort((a, b) => a.position - b.position)
  )
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const canAdd = photos.length < 10

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.append('photo', file)
    const result = await uploadUserPhoto(formData)

    if ('error' in result) {
      setError(result.error)
    } else {
      setPhotos((prev) => [...prev, result.photo])
    }
    setUploading(false)
    // Reset so the same file can be re-selected after error
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(photoId: string) {
    setDeletingId(photoId)
    const result = await deleteUserPhoto(photoId)
    if ('error' in result) {
      setError(result.error)
    } else {
      setPhotos((prev) => {
        const next = prev.filter((p) => p.id !== photoId)
        return next.map((p, i) => ({ ...p, position: i }))
      })
    }
    setDeletingId(null)
  }

  async function move(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= photos.length) return

    const next = [...photos]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    const reindexed = next.map((p, i) => ({ ...p, position: i }))
    setPhotos(reindexed) // optimistic

    const result = await reorderUserPhotos(reindexed.map((p) => p.id))
    if ('error' in result) {
      setError(result.error)
      setPhotos(photos) // revert on failure
    }
  }

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
          const isDeleting = deletingId === photo.id

          return (
            <div
              key={photo.id}
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

              {/* Primary label */}
              {isPrimary && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-accent/90 backdrop-blur-sm text-[9px] text-white font-body font-semibold uppercase tracking-wider pointer-events-none">
                  Primary
                </div>
              )}

              {/* Controls — visible on hover */}
              <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-1.5">
                {/* Delete */}
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={isDeleting}
                  className="self-end w-6 h-6 rounded-full bg-black/50 hover:bg-accent/80 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={11} className="text-white" />
                </button>

                {/* Reorder arrows */}
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
        {photos.length} / 10 photos · Hover a photo to reorder or delete ·
        First photo is your primary
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
