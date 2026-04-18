import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatClient } from './ChatClient'
import type { UserProfile, Message } from '@/types'

export default async function MatchChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .single()

  if (!match) redirect('/matches')

  const otherId = match.user_a === user.id ? match.user_b : match.user_a

  const [
    { data: otherUser },
    { data: messages },
    { data: compatScore },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', otherId).single(),
    supabase.from('messages').select('*').eq('match_id', matchId)
      .order('created_at', { ascending: true }).limit(100),
    supabase.from('compatibility_scores')
      .select('score')
      .or(`and(user_a_id.eq.${user.id},user_b_id.eq.${otherId}),and(user_a_id.eq.${otherId},user_b_id.eq.${user.id})`)
      .maybeSingle(),
  ])

  if (!otherUser) redirect('/matches')

  return (
    <ChatClient
      matchId={matchId}
      currentUserId={user.id}
      otherUser={otherUser as UserProfile}
      initialMessages={(messages ?? []) as Message[]}
      compatibilityScore={compatScore?.score ?? null}
    />
  )
}
