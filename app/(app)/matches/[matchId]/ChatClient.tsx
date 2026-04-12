'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { sendMessage } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'
import { TierBadge } from '@/components/TierBadge'
import { getTier, TIER_COLORS } from '@/lib/utils'
import { ArrowLeft, Send } from 'lucide-react'
import type { UserProfile, Message } from '@/types'

interface Props {
  matchId: string
  currentUserId: string
  otherUser: UserProfile
  initialMessages: Message[]
}

export function ChatClient({ matchId, currentUserId, otherUser, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const tier = getTier(otherUser.average_score)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [matchId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      match_id: matchId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    await sendMessage(matchId, content)
    setSending(false)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-rim bg-surface/80 backdrop-blur-sm">
        <Link href="/matches" className="text-muted hover:text-cream transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div
          className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: TIER_COLORS[tier] }}
        >
          {otherUser.photo_url ? (
            <Image
              src={otherUser.photo_url}
              alt={otherUser.name}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-rim flex items-center justify-center">
              <span className="font-display font-bold text-sm" style={{ color: TIER_COLORS[tier] }}>
                {otherUser.name[0]}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-body font-semibold text-cream text-sm">{otherUser.name}</div>
          <TierBadge score={otherUser.average_score} size="sm" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted font-body text-sm">
              You matched with {otherUser.name}! Say hello 👋
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-body ${
                  isMe
                    ? 'bg-accent text-cream rounded-br-sm'
                    : 'bg-surface border border-rim text-cream rounded-bl-sm'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-cream/60' : 'text-muted'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-4 border-t border-rim bg-surface/80 backdrop-blur-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 px-4 py-3 rounded-full bg-bg border border-rim text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/60 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-cream disabled:opacity-40 hover:bg-accent/90 transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
