'use client'

import { useState } from 'react'
import { X, MessageCircle, Send } from 'lucide-react'
import { sendConvinceMe } from '@/lib/actions'
import Image from 'next/image'
import { getTier, TIER_COLORS } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface Props {
  nearMatchId: string
  /** The rater — the person being convinced to upgrade their rating */
  recipient: Pick<UserProfile, 'id' | 'name' | 'photo_url' | 'average_score'>
  onClose: () => void
  onSent: () => void
}

export function ConvinceMeModal({ nearMatchId, recipient, onClose, onSent }: Props) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tier = getTier(recipient.average_score)
  const tierColor = TIER_COLORS[tier]

  async function handleSend() {
    if (!message.trim() || sending) return
    setSending(true)
    setError(null)
    const result = await sendConvinceMe(nearMatchId, message)
    setSending(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    onSent()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-6 sm:pb-0"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm bg-surface border border-rim rounded-3xl p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-cream transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div
            className="relative w-11 h-11 rounded-full overflow-hidden border-2 flex-shrink-0"
            style={{ borderColor: tierColor }}
          >
            {recipient.photo_url ? (
              <Image src={recipient.photo_url} alt={recipient.name} fill className="object-cover" sizes="44px" />
            ) : (
              <div className="w-full h-full bg-rim flex items-center justify-center">
                <span className="font-display font-bold text-sm" style={{ color: tierColor }}>
                  {recipient.name[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={13} className="text-accent" />
              <span className="text-xs text-accent font-body font-semibold uppercase tracking-wider">
                Convince Me
              </span>
            </div>
            <div className="font-body font-semibold text-cream text-sm">
              To {recipient.name}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted font-body leading-relaxed">
          {`${recipient.name} gave you a 4. Send them a message — if they upgrade your rating to 5+, you'll match.`}
        </p>

        {/* Message input */}
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); setError(null) }}
          placeholder={`Give ${recipient.name} a reason to upgrade your rating…`}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-3 rounded-xl bg-bg border border-rim text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/60 transition-colors resize-none"
        />
        <div className="flex justify-between items-center -mt-3">
          {error && <p className="text-xs text-accent font-body">{error}</p>}
          <span className="text-xs text-muted font-body ml-auto">{message.length}/500</span>
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-cream font-body font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          <Send size={14} />
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </div>
  )
}
