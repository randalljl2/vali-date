import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { TierBadge } from '@/components/TierBadge'
import { ConvinceMeIncomingSection } from '@/components/ConvinceMeIncomingSection'
import { getTier, TIER_COLORS } from '@/lib/utils'
import { MessageCircle, Heart } from 'lucide-react'
import type { UserProfile, Match, SubscriptionTier } from '@/types'
import { MatchesClient } from './MatchesClient'

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profileData } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const subscriptionTier = (profileData?.subscription_tier ?? 'free') as SubscriptionTier

  // Fetch matches involving current user
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Fetch the other user's profile for each match
  const otherIds = (matches ?? []).map((m: Match) =>
    m.user_a === user.id ? m.user_b : m.user_a
  )

  const { data: otherProfiles } = otherIds.length
    ? await supabase.from('users').select('*').in('id', otherIds)
    : { data: [] }

  const profileMap = new Map(
    (otherProfiles ?? []).map((p: UserProfile) => [p.id, p])
  )

  // Latest message per match
  const matchIds = (matches ?? []).map((m: Match) => m.id)
  const { data: latestMessages } = matchIds.length
    ? await supabase
        .from('messages')
        .select('match_id, content, created_at')
        .in('match_id', matchIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const lastMsgMap = new Map(
    (latestMessages ?? []).map((m: { match_id: string; content: string; created_at: string }) =>
      [m.match_id, m]
    )
  )

  // ── Convince Me: incoming messages where user is the RATER (recipient) ──
  // B (rated) sent these to A (user, the rater) asking A to upgrade from 4 → 5+
  const { data: incomingConvinceMe } = await supabase
    .from('convince_me_messages')
    .select('*')
    .eq('recipient_id', user.id)
    .eq('converted_to_match', false)
    .order('created_at', { ascending: false })

  // Fetch sender (B) profiles for incoming convince me
  const senderIds = (incomingConvinceMe ?? []).map((m) => m.sender_id)
  const { data: senderProfiles } = senderIds.length
    ? await supabase.from('users').select('id, name, photo_url, average_score').in('id', senderIds)
    : { data: [] }
  const senderMap = new Map((senderProfiles ?? []).map((p) => [p.id, p]))

  // ── On the Fence: near matches I created (I rated them 4) ──
  const { data: myNearMatches } = await supabase
    .from('near_matches')
    .select('*')
    .eq('rater_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Filter out near matches that became real matches
  const matchedUserIds = new Set(
    (matches ?? []).map((m: Match) => m.user_a === user.id ? m.user_b : m.user_a)
  )
  const activeNearMatches = (myNearMatches ?? []).filter((nm) => !matchedUserIds.has(nm.rated_id))

  // Fetch rated profiles for near matches (if Plus/Premium)
  const ratedNearMatchIds = activeNearMatches.map((nm) => nm.rated_id)
  const { data: ratedProfiles } = ratedNearMatchIds.length && subscriptionTier !== 'free'
    ? await supabase.from('users').select('id, name, photo_url, average_score').in('id', ratedNearMatchIds)
    : { data: [] }
  const ratedMap = new Map((ratedProfiles ?? []).map((p) => [p.id, p]))

  // Which of A's near matches have received a convince me FROM the rated person (B)?
  // sender = B (rated_id), recipient = A (user.id)
  const nearMatchIds = activeNearMatches.map((nm) => nm.id)
  const { data: receivedMessages } = nearMatchIds.length
    ? await supabase
        .from('convince_me_messages')
        .select('near_match_id')
        .in('near_match_id', nearMatchIds)
        .eq('recipient_id', user.id)
    : { data: [] }
  const receivedConvinceMeSet = new Set((receivedMessages ?? []).map((m) => m.near_match_id))

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Heart size={22} className="text-accent fill-accent/30" />
        <h1 className="font-display font-bold text-2xl text-cream">Matches</h1>
        {matches && matches.length > 0 && (
          <span className="text-xs text-muted font-body px-2 py-0.5 rounded-full bg-surface border border-rim">
            {matches.length}
          </span>
        )}
      </div>

      {/* Incoming convince me messages — A (user) is the rater being asked to upgrade */}
      <ConvinceMeIncomingSection
        messages={(incomingConvinceMe ?? []).map((msg) => ({
          ...msg,
          sender: senderMap.get(msg.sender_id) ?? null,
        }))}
      />

      {/* On the Fence — near matches I sent (my outgoing 4-ratings) */}
      {activeNearMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs font-body font-semibold text-muted uppercase tracking-widest">
              On the Fence
            </span>
            <span className="text-xs text-muted font-body">{activeNearMatches.length}</span>
          </div>
          <MatchesClient
            nearMatches={activeNearMatches.map((nm) => ({
              ...nm,
              rated: ratedMap.get(nm.rated_id) ?? null,
            }))}
            subscriptionTier={subscriptionTier}
            receivedConvinceMe={[...receivedConvinceMeSet]}
          />
        </div>
      )}

      {/* Regular matches */}
      {!matches || matches.length === 0 ? (
        (!incomingConvinceMe || incomingConvinceMe.length === 0) && activeNearMatches.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-16">
            <div className="w-16 h-16 rounded-full bg-surface border border-rim flex items-center justify-center">
              <Heart size={24} className="text-muted" />
            </div>
            <h2 className="font-display font-bold text-xl text-cream">No matches yet</h2>
            <p className="text-muted font-body text-sm max-w-xs leading-relaxed">
              Rate profiles 5 or higher and when they rate you back, you&apos;ll match.
            </p>
            <Link
              href="/discover"
              className="px-6 py-3 rounded-xl bg-accent text-cream font-body font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              Start discovering
            </Link>
          </div>
        )
      ) : (
        <div className="space-y-2 pb-4">
          {matches.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-body font-semibold text-[#2db896] uppercase tracking-widest">
                Your Matches
              </span>
              <span className="text-xs text-muted font-body">{matches.length}</span>
            </div>
          )}
          {(matches ?? []).map((match: Match) => {
            const otherId = match.user_a === user.id ? match.user_b : match.user_a
            const other = profileMap.get(otherId)
            if (!other) return null

            const tier = getTier(other.average_score)
            const lastMsg = lastMsgMap.get(match.id)

            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl border border-rim bg-surface hover:border-accent/30 transition-colors"
              >
                <div
                  className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2"
                  style={{ borderColor: TIER_COLORS[tier] }}
                >
                  {other.photo_url ? (
                    <Image
                      src={other.photo_url}
                      alt={other.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="w-full h-full bg-rim flex items-center justify-center">
                      <span
                        className="font-display font-bold text-lg"
                        style={{ color: TIER_COLORS[tier] }}
                      >
                        {other.name[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-cream">{other.name}</span>
                    <TierBadge score={other.average_score} size="sm" />
                  </div>
                  <p className="text-xs text-muted font-body mt-0.5 truncate">
                    {lastMsg ? lastMsg.content : 'Say hello! 👋'}
                  </p>
                </div>

                <MessageCircle size={18} className="text-muted flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
