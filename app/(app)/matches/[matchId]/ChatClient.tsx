'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { sendMessage } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, Message } from '@/types'

interface Props {
  matchId: string
  currentUserId: string
  otherUser: UserProfile
  initialMessages: Message[]
  compatibilityScore: number | null
}

export function ChatClient({ matchId, currentUserId, otherUser, initialMessages, compatibilityScore }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        const msg = payload.new as Message
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [matchId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      match_id: matchId,
      sender_id: currentUserId,
      content,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    await sendMessage(matchId, content)
    setSending(false)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-screen bg-bg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface/90 backdrop-blur-sm">
        <Link href="/matches" className="text-muted hover:text-ink-2 transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <Link href={`/profile/${otherUser.id}`}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
          {otherUser.photo_url ? (
            <Image src={otherUser.photo_url} alt={otherUser.name} width={40} height={40} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full bg-border-soft flex items-center justify-center">
              <span className="font-display font-bold text-sm text-ink-2">{otherUser.name[0]}</span>
            </div>
          )}
        </Link>

        <Link href={`/profile/${otherUser.id}`} className="flex-1 min-w-0">
          <div className="font-body font-semibold text-ink text-sm">{otherUser.name}</div>
          {compatibilityScore !== null && (
            <div className="text-xs text-muted font-body">{compatibilityScore}% compatible</div>
          )}
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted font-body text-sm">
              You matched with {otherUser.name}! Say hello.
            </p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[76%] px-4 py-2.5 rounded-2xl text-sm font-body ${
                isMe
                  ? 'bg-accent text-white rounded-br-sm'
                  : 'bg-surface border border-border text-ink rounded-bl-sm'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-muted'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-3.5 border-t border-border bg-surface/90 backdrop-blur-sm">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 px-4 py-3 rounded-full bg-bg border border-border text-ink placeholder-muted font-body text-sm outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white disabled:opacity-40 hover:bg-accent-soft transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
