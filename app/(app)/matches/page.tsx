import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, Heart } from 'lucide-react'
import type { UserProfile, Match, Message, MutualInterest, MatchWithProfile } from '@/types'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Active matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })

  const otherIds = (matches ?? []).map((m: Match) => m.user_a === user.id ? m.user_b : m.user_a)
  const matchIds = (matches ?? []).map((m: Match) => m.id)

  const [{ data: otherProfiles }, { data: latestMsgs }, { data: compatScores }] = await Promise.all([
    otherIds.length
      ? supabase.from('users').select('*').in('id', otherIds)
      : Promise.resolve({ data: [] }),
    matchIds.length
      ? supabase.from('messages').select('match_id, content, created_at, sender_id')
          .in('match_id', matchIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    otherIds.length
      ? supabase.from('compatibility_scores')
          .select('user_a_id, user_b_id, score')
          .or(otherIds.map(id => `user_a_id.eq.${id},user_b_id.eq.${id}`).join(','))
      : Promise.resolve({ data: [] }),
  ])

  const profileMap = new Map((otherProfiles ?? []).map((p: UserProfile) => [p.id, p]))

  // latest message per match
  const lastMsgMap = new Map<string, { content: string }>()
  for (const msg of (latestMsgs ?? []) as (Message & { match_id: string })[]) {
    if (!lastMsgMap.has(msg.match_id)) lastMsgMap.set(msg.match_id, msg)
  }

  // compatibility per user pair
  const compatMap = new Map<string, number>()
  for (const cs of (compatScores ?? []) as { user_a_id: string; user_b_id: string; score: number }[]) {
    const otherId = cs.user_a_id === user.id ? cs.user_b_id : cs.user_a_id
    compatMap.set(otherId, cs.score)
  }

  const matchList: MatchWithProfile[] = (matches ?? []).map((m: Match) => {
    const otherId = m.user_a === user.id ? m.user_b : m.user_a
    return {
      ...m,
      otherUser: profileMap.get(otherId) as UserProfile,
      lastMessage: lastMsgMap.get(m.id) as Message | null ?? null,
      compatibilityScore: compatMap.get(otherId) ?? null,
      sharedAnswers: 0,
    }
  }).filter(m => !!m.otherUser)

  // "On the fence" — mutual interest but no match (compatibility < 60 or < 10 shared)
  const { data: iSent } = await supabase.from('interests').select('recipient_id').eq('sender_id', user.id)
  const { data: theyLiked } = await supabase.from('interests').select('sender_id').eq('recipient_id', user.id)

  const iSentSet = new Set((iSent ?? []).map((r: { recipient_id: string }) => r.recipient_id))
  const theyLikedSet = new Set((theyLiked ?? []).map((r: { sender_id: string }) => r.sender_id))
  const matchedSet = new Set(otherIds)

  const mutualIds = [...iSentSet].filter(id => theyLikedSet.has(id) && !matchedSet.has(id))

  let fenceProfiles: MutualInterest[] = []
  if (mutualIds.length > 0) {
    const { data: fenceData } = await supabase.from('users').select('*').in('id', mutualIds)
    const { data: fenceCompat } = await supabase.from('compatibility_scores')
      .select('user_a_id, user_b_id, score, shared_answers')
      .or(mutualIds.map(id => `user_a_id.eq.${id},user_b_id.eq.${id}`).join(','))

    const fenceCompatMap = new Map<string, { score: number; shared_answers: number }>()
    for (const cs of (fenceCompat ?? []) as { user_a_id: string; user_b_id: string; score: number; shared_answers: number }[]) {
      const otherId = cs.user_a_id === user.id ? cs.user_b_id : cs.user_a_id
      fenceCompatMap.set(otherId, cs)
    }

    fenceProfiles = (fenceData ?? []).map((p: UserProfile) => ({
      otherUser: p,
      compatibilityScore: fenceCompatMap.get(p.id)?.score ?? null,
      sharedAnswers: fenceCompatMap.get(p.id)?.shared_answers ?? 0,
    }))
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Heart size={22} className="text-accent" fill="#7a2535" fillOpacity={0.25} />
        <h1 className="font-display font-bold text-2xl text-ink">Matches</h1>
        {matchList.length > 0 && (
          <span className="text-xs text-muted font-body px-2 py-0.5 rounded-full bg-surface border border-border">
            {matchList.length}
          </span>
        )}
      </div>

      {/* On the fence */}
      {fenceProfiles.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-body font-semibold text-muted uppercase tracking-widest">On the fence</h2>
            <span className="text-xs text-muted font-body">
              — mutual interest, compatibility below threshold
            </span>
          </div>
          <div className="space-y-2">
            {fenceProfiles.map(({ otherUser, compatibilityScore, sharedAnswers }) => (
              <div key={otherUser.id}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
                  {otherUser.photo_url ? (
                    <Image src={otherUser.photo_url} alt={otherUser.name} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="w-full h-full bg-border-soft flex items-center justify-center">
                      <span className="font-display font-bold text-ink-2">{otherUser.name[0]}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-medium text-ink text-sm">{otherUser.name}, {otherUser.age}</p>
                  <p className="text-xs text-muted font-body mt-0.5">
                    {compatibilityScore !== null
                      ? `${compatibilityScore}% compatible — below 60% threshold`
                      : sharedAnswers > 0
                      ? `${sharedAnswers} shared answers — need 10+ to score`
                      : 'Not enough shared answers yet'}
                  </p>
                </div>
                <Link href="/questions"
                  className="text-xs font-body text-accent border border-accent/30 rounded-lg px-2.5 py-1.5 hover:bg-accent/5 transition-colors flex-shrink-0">
                  Improve score
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Match list */}
      {matchList.length === 0 && fenceProfiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-border-soft flex items-center justify-center">
            <Heart size={24} className="text-muted" />
          </div>
          <h2 className="font-display font-bold text-xl text-ink">No matches yet</h2>
          <p className="text-muted font-body text-sm max-w-xs leading-relaxed">
            Express interest in profiles you like. When it&apos;s mutual and compatibility reaches 60%,
            you&apos;ll match.
          </p>
          <Link href="/discover"
            className="px-6 py-3 rounded-xl bg-accent text-white font-body font-medium text-sm hover:bg-accent-soft transition-colors">
            Start discovering
          </Link>
        </div>
      ) : matchList.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-body font-semibold text-muted uppercase tracking-widest">Your matches</h2>
          <div className="space-y-2">
            {matchList.map(match => (
              <Link key={match.id} href={`/matches/${match.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-accent/30 transition-colors">
                <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
                  {match.otherUser.photo_url ? (
                    <Image src={match.otherUser.photo_url} alt={match.otherUser.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full bg-border-soft flex items-center justify-center">
                      <span className="font-display font-bold text-xl text-ink-2">{match.otherUser.name[0]}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-ink text-sm">{match.otherUser.name}</span>
                    {match.compatibilityScore !== null && (
                      <span className="text-xs font-body text-muted">
                        {match.compatibilityScore}% match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted font-body mt-0.5 truncate">
                    {match.lastMessage ? match.lastMessage.content : `Say hello to ${match.otherUser.name}!`}
                  </p>
                </div>
                <MessageCircle size={18} className="text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
