import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuestionsClient } from './QuestionsClient'
import type { UserAnswer } from '@/types'

export default async function QuestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all existing answers for sets 2–4
  const { data: answers } = await supabase
    .from('user_answers')
    .select('question_set, question_number, answer, importance')
    .eq('user_id', user.id)
    .in('question_set', [2, 3, 4])

  return (
    <QuestionsClient initialAnswers={(answers ?? []) as UserAnswer[]} />
  )
}
