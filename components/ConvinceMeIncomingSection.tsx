'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TierBadge } from '@/components/TierBadge'
import { acceptConvinceMe } from '@/lib/actions'
import { getTier, TIER_COLORS } from '@/lib/utils'
import { Heart, MessageCircle } from 'lucide-react'
import type { UserProfile } from '@/types'

interface IncomingMessage {
  id: string
  sender_id: string
  message: string
  created_at: string
  sender: Pick<UserProfile, 'id' | 'name' | 'photo_url' | 'average_score'> | null
}

interface Props {
  messages: IncomingMessage[]
}

export function ConvinceMeIncomingSection({ messages }: Props) {
  const [accepting, setAccepting] = useState<string | null>(null)
  const [matchedMap, setMatchedMap] = useState<Record<string, string | null>>({})
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  if (messages.length === 0) return null

  async function handleAccept(msg: IncomingMessage) {
    if (accepting) return
    setAccepting(msg.id)
    const result = await acceptConvinceMe(msg.id)
    setAccepting(null)
    if ('error' in result) return
    setMatchedMap((m) => ({ ...m, [msg.id]: result.matchId }))
  }

  const visible = messages.filter((m) => !dismissed.has(m.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-body font-semibold text-accent uppercase tracking-widest">
          Convince Me
        </span>
        <span className="text-xs text-muted font-body">{visible.length}</span>
      </div>

      {visible.map((msg) => {
        const sender = msg.sender
        if (!sender) return null
        const tier = getTier(sender.average_score)
        const matched = msg.id in matchedMap

        if (matched) {
          const matchId = matchedMap[msg.id]
          return (
            <div
              key={msg.id}
              className="rounded-2xl border border-[#2db896]/50 bg-[#2db896]/8 p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-[#2db896] fill-current" />
                <span className="text-sm font-body font-semibold text-[#2db896]">
                  It&apos;s a match with {sender.name}!
                </span>
              </div>
              {matchId && (
                <Link
                  href={`/matches/${matchId}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2db896] text-bg font-body font-semibold text-sm hover:bg-[#2db896]/90 transition-colors"
                >
                  <MessageCircle size={14} />
                  Start chatting
                </Link>
              )}
            </div>
          )
        }

        return (
          <div
            key={msg.id}
            className="rounded-2xl border border-accent/30 bg-accent/5 p-4 space-y-3"
          >
            {/* Sender */}
            <div className="flex items-center gap-3">
              <div
                className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2"
                style={{ borderColor: TIER_COLORS[tier] }}
              >
                {sender.photo_url ? (
                  <Image
                    src={sender.photo_url}
                    alt={sender.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full bg-rim flex items-center justify-center">
                    <span
                      className="font-display font-bold text-lg"
                      style={{ color: TIER_COLORS[tier] }}
                    >
                      {sender.name[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body font-semibold text-cream">{sender.name}</span>
                  <TierBadge score={sender.average_score} size="sm" />
                </div>
                <p className="text-xs text-accent font-body">wants you to upgrade their rating</p>
              </div>
            </div>

            {/* Message */}
            <blockquote className="text-sm font-body text-cream/80 bg-bg rounded-xl px-3 py-3 border border-rim italic leading-relaxed">
              &ldquo;{msg.message}&rdquo;
            </blockquote>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(msg)}
                disabled={accepting === msg.id}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent text-cream font-body font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                <Heart size={13} />
                {accepting === msg.id ? 'Matching…' : 'Upgrade to 5 — match'}
              </button>
              <button
                onClick={() => setDismissed((s) => new Set([...s, msg.id]))}
                className="px-3 py-2.5 rounded-xl border border-rim text-muted font-body text-xs hover:text-cream hover:border-cream/30 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
