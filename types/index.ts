export type Gender = 'man' | 'woman' | 'non-binary' | 'prefer-not-to-say'
export type ShowMe = 'men' | 'women' | 'everyone'
export type HereFor =
  | 'post-breakup-reset'
  | 'boredom-curiosity'
  | 'actually-dating'
  | 'confidence-building'
export type SubscriptionTier = 'free' | 'plus' | 'premium'

export const GENDER_LABELS: Record<Gender, string> = {
  'man': 'Man',
  'woman': 'Woman',
  'non-binary': 'Non-binary',
  'prefer-not-to-say': 'Prefer not to say',
}

export const SHOW_ME_LABELS: Record<ShowMe, string> = {
  'men': 'Men',
  'women': 'Women',
  'everyone': 'Everyone',
}

export const HERE_FOR_LABELS: Record<HereFor, string> = {
  'post-breakup-reset': 'Post-breakup reset',
  'boredom-curiosity': 'Boredom + curiosity',
  'actually-dating': 'Actually dating',
  'confidence-building': 'Confidence building',
}

export const PROMPTS = [
  'The last time I felt really attractive was...',
  'My biggest green flag is...',
  'My therapist would describe me as...',
  'My most controversial opinion is...',
  "Honestly, I'm here because...",
] as const

export type Prompt = typeof PROMPTS[number]

export interface UserProfile {
  id: string
  name: string
  age: number
  city: string
  here_for: HereFor
  bio: string | null
  photo_url: string | null
  height_cm: number | null
  gender: Gender | null
  show_me: ShowMe | null
  preferred_age_min: number | null
  preferred_age_max: number | null
  min_compatibility_threshold: number
  subscription_tier: SubscriptionTier
  prompt_1_question: string | null
  prompt_1_answer: string | null
  prompt_2_question: string | null
  prompt_2_answer: string | null
  created_at: string
  updated_at: string
}

export interface UserPhoto {
  id: string
  user_id: string
  url: string
  storage_path: string
  position: number
  created_at: string
}

export interface Match {
  id: string
  user_a: string
  user_b: string
  created_at: string
}

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  read_at: string | null
  created_at: string
}

export interface Interest {
  id: string
  sender_id: string
  recipient_id: string
  created_at: string
}

export interface UserAnswer {
  id: string
  user_id: string
  question_set: number
  question_number: number
  answer: 'a' | 'b' | 'c'
  importance: 1 | 2 | 3
  created_at: string
}

export interface CompatibilityScore {
  id: string
  user_a_id: string
  user_b_id: string
  score: number
  shared_answers: number
  calculated_at: string
}

export interface DailyConfidence {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
}

export interface MatchWithProfile extends Match {
  otherUser: UserProfile
  lastMessage: Message | null
  compatibilityScore: number | null
  sharedAnswers: number
}

export interface MutualInterest {
  otherUser: UserProfile
  compatibilityScore: number | null
  sharedAnswers: number
}

export interface DiscoverProfile extends UserProfile {
  photos: UserPhoto[]
  compatibilityScore: number | null
  sharedAnswers: number
  confidenceToday: number | null
}
