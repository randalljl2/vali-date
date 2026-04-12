export type SubscriptionTier = 'free' | 'plus' | 'premium'

export type HereFor =
  | 'post-breakup-reset'
  | 'boredom-curiosity'
  | 'actually-dating'
  | 'confidence-building'

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
  'Honestly, I\'m here because...',
] as const

export type Prompt = typeof PROMPTS[number]

export type Tier = 'Newcomer' | 'Rising' | 'Validated' | 'Certified' | 'Iconic'

export interface UserProfile {
  id: string
  name: string
  age: number
  city: string
  here_for: HereFor
  bio: string | null
  photo_url: string | null
  average_score: number
  rating_count: number
  prompt_1_question: string | null
  prompt_1_answer: string | null
  prompt_2_question: string | null
  prompt_2_answer: string | null
  preferred_age_min: number | null
  preferred_age_max: number | null
  subscription_tier: SubscriptionTier
  score_snapshot: number | null
  score_snapshot_at: string | null
  hot_streak_boost_activated_at: string | null
  created_at: string
  updated_at: string
}

export interface NearMatch {
  id: string
  rater_id: string
  rated_id: string
  score: number
  created_at: string
}

export interface NearMatchWithRater extends NearMatch {
  rater: Pick<UserProfile, 'id' | 'name' | 'photo_url' | 'average_score'>
}

export interface ConvinceMeMessage {
  id: string
  sender_id: string
  recipient_id: string
  near_match_id: string
  message: string
  created_at: string
  converted_to_match: boolean
}

export interface ConvinceMeWithSender extends ConvinceMeMessage {
  sender: Pick<UserProfile, 'id' | 'name' | 'photo_url' | 'average_score'>
  near_match: NearMatch
}

export interface Subscription {
  user_id: string
  tier: SubscriptionTier
  started_at: string
  expires_at: string | null
}

export interface Rating {
  id: string
  rater_id: string
  rated_id: string
  score: number
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
  created_at: string
}

export interface Streak {
  user_id: string
  current_streak: number
  last_active: string
  longest_streak: number
  updated_at: string
}

export interface DailyConfidence {
  id: string
  user_id: string
  score: number
  date: string
}

export interface UserPhoto {
  id: string
  user_id: string
  url: string
  position: number
  created_at: string
}

// Extended types with joins
export interface MatchWithProfile extends Match {
  other_user: UserProfile
}

export interface MessageWithSender extends Message {
  sender: Pick<UserProfile, 'id' | 'name' | 'photo_url'>
}

export interface LeaderboardEntry extends UserProfile {
  streak: Streak | null
  rank: number
}
