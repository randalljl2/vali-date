'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TierBadge } from '@/components/TierBadge'
import { StreakBadge } from '@/components/StreakBadge'
import { TierProgressBar } from '@/components/TierProgressBar'
import { PhotoGrid } from '@/components/PhotoGrid'
import { HotStreakBanner } from '@/components/HotStreakBanner'
import { signOut, updateDailyConfidence, updateUserPrompts, updateAgePreference, updateScoreSnapshot } from '@/lib/actions'
import { getTier, TIER_COLORS, getStreakPerk, getNextStreakPerk, displayScore } from '@/lib/utils'
import { HERE_FOR_LABELS, PROMPTS } from '@/types'
import type { UserProfile, UserPhoto, Streak, DailyConfidence, Tier } from '@/types'
import { AgeRangeSlider } from '@/components/AgeRangeSlider'
import { MapPin, LogOut, Pencil, X, Check, Crown, Zap, TrendingUp, Sparkles } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface Props {
  profile: UserProfile
  photos: UserPhoto[]
  streak: Streak | null
  todayConfidence: DailyConfidence | null
  matchCount: number
  ratingsGiven: number
  email: string
  tierMovedUp: boolean
  currentTier: Tier
  boostActivatedAt: string | null
  boostActive: boolean
  boostUsedThisWeek: boolean
}

const STREAK_PERKS = [
  { days: 3,  label: 'Shown to 10% more people', icon: '📢' },
  { days: 7,  label: 'Boosted badge',             icon: '⚡' },
  { days: 14, label: 'Priority in discover feed', icon: '🚀' },
  { days: 30, label: 'Iconic border effect',      icon: '✦' },
]

const TIER_SUBSCRIPTION_ICONS = {
  free: null,
  plus: Zap,
  premium: Crown,
}
const TIER_SUBSCRIPTION_COLORS = {
  free: '#8a7878',
  plus: '#e8c46a',
  premium: '#9b6dff',
}
const TIER_SUBSCRIPTION_LABELS = {
  free: 'Free',
  plus: 'Vali Date Plus',
  premium: 'Vali Date Premium',
}

export function ProfileClient({
  profile,
  photos,
  streak,
  todayConfidence,
  matchCount,
  ratingsGiven,
  email,
  tierMovedUp,
  currentTier,
  boostActivatedAt,
  boostActive: initialBoostActive,
  boostUsedThisWeek,
}: Props) {
  const [confidence, setConfidence] = useState(todayConfidence?.score ?? 7)
  const [savingConf, setSavingConf] = useState(false)
  const [confSaved, setConfSaved] = useState(!!todayConfidence)

  // Prompts edit state
  const [editingPrompts, setEditingPrompts] = useState(false)
  const [editPicked, setEditPicked] = useState<string[]>([
    profile.prompt_1_question,
    profile.prompt_2_question,
  ].filter(Boolean) as string[])
  const [editAnswers, setEditAnswers] = useState<Record<string, string>>({
    ...(profile.prompt_1_question ? { [profile.prompt_1_question]: profile.prompt_1_answer ?? '' } : {}),
    ...(profile.prompt_2_question ? { [profile.prompt_2_question]: profile.prompt_2_answer ?? '' } : {}),
  })
  const [savingPrompts, setSavingPrompts] = useState(false)
  const [promptError, setPromptError] = useState<string | null>(null)

  // Live-updated prompt display (updated after save)
  const [savedPrompts, setSavedPrompts] = useState({
    p1q: profile.prompt_1_question,
    p1a: profile.prompt_1_answer,
    p2q: profile.prompt_2_question,
    p2a: profile.prompt_2_answer,
  })

  // Age preference state
  const [ageMin, setAgeMin] = useState(profile.preferred_age_min ?? 18)
  const [ageMax, setAgeMax] = useState(profile.preferred_age_max ?? 65)
  const [savingAge, setSavingAge] = useState(false)
  const [ageSaved, setAgeSaved] = useState(false)
  const [ageError, setAgeError] = useState<string | null>(null)

  async function handleAgeSave() {
    setSavingAge(true)
    setAgeError(null)
    const result = await updateAgePreference(ageMin, ageMax)
    setSavingAge(false)
    if ('error' in result) { setAgeError(result.error); return }
    setAgeSaved(true)
    setTimeout(() => setAgeSaved(false), 2500)
  }

  const tier = getTier(profile.average_score)
  const isIconic = tier === 'Iconic'
  const currentStreak = streak?.current_streak ?? 0
  const perk = getStreakPerk(currentStreak)
  const nextPerk = getNextStreakPerk(currentStreak)

  // Tier movement celebration — show once, then update snapshot
  const [showTierCelebration, setShowTierCelebration] = useState(tierMovedUp)
  useEffect(() => {
    if (!tierMovedUp) return
    // After 5s, hide celebration and update snapshot
    const t = setTimeout(() => {
      setShowTierCelebration(false)
      updateScoreSnapshot()
    }, 5000)
    return () => clearTimeout(t)
  }, [tierMovedUp])

  const subscriptionTier = profile.subscription_tier
  const SubscriptionIcon = TIER_SUBSCRIPTION_ICONS[subscriptionTier]
  const subscriptionColor = TIER_SUBSCRIPTION_COLORS[subscriptionTier]
  const subscriptionLabel = TIER_SUBSCRIPTION_LABELS[subscriptionTier]

  // Profile completion quests
  const questPhotos = photos.length >= 3
  const questPrompts = !!(profile.prompt_1_answer && profile.prompt_2_answer)
  const questAge = profile.preferred_age_min !== null
  const questsDone = [questPhotos, questPrompts, questAge].filter(Boolean).length
  const allQuestsDone = questsDone === 3

  function toggleEditPrompt(q: string) {
    if (editPicked.includes(q)) {
      setEditPicked((p) => p.filter((x) => x !== q))
    } else if (editPicked.length < 2) {
      setEditPicked((p) => [...p, q])
    }
  }

  async function handlePromptsSave() {
    setPromptError(null)
    if (editPicked.length < 2) { setPromptError('Pick 2 prompts'); return }
    if (editPicked.some((q) => !(editAnswers[q] ?? '').trim())) {
      setPromptError('Answer both prompts'); return
    }
    setSavingPrompts(true)
    const result = await updateUserPrompts({
      prompt_1_question: editPicked[0],
      prompt_1_answer: (editAnswers[editPicked[0]] ?? '').trim(),
      prompt_2_question: editPicked[1],
      prompt_2_answer: (editAnswers[editPicked[1]] ?? '').trim(),
    })
    setSavingPrompts(false)
    if ('error' in result) { setPromptError(result.error); return }
    setSavedPrompts({
      p1q: editPicked[0],
      p1a: (editAnswers[editPicked[0]] ?? '').trim(),
      p2q: editPicked[1],
      p2a: (editAnswers[editPicked[1]] ?? '').trim(),
    })
    setEditingPrompts(false)
  }

  function cancelPromptEdit() {
    setEditPicked([savedPrompts.p1q, savedPrompts.p2q].filter(Boolean) as string[])
    setEditAnswers({
      ...(savedPrompts.p1q ? { [savedPrompts.p1q]: savedPrompts.p1a ?? '' } : {}),
      ...(savedPrompts.p2q ? { [savedPrompts.p2q]: savedPrompts.p2a ?? '' } : {}),
    })
    setPromptError(null)
    setEditingPrompts(false)
  }

  async function handleConfidenceSave() {
    setSavingConf(true)
    await updateDailyConfidence(confidence)
    setSavingConf(false)
    setConfSaved(true)
  }

  return (
    <div className="flex flex-col min-h-screen pb-6">
      {/* Tier movement celebration overlay */}
      {showTierCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-6">
          <div className="bg-surface border border-[#e8c46a]/50 rounded-3xl px-8 py-7 text-center shadow-2xl animate-fade-in-up w-full max-w-xs pointer-events-auto">
            <div className="text-4xl mb-3">✦</div>
            <div className="font-display font-bold text-2xl text-cream mb-1">Tier Up!</div>
            <div className="text-muted text-sm font-body mb-2">
              You moved up to
            </div>
            <div
              className="font-display font-bold text-xl mb-4"
              style={{ color: TIER_COLORS[currentTier] }}
            >
              {currentTier}
            </div>
            <p className="text-xs text-muted font-body">Keep rating and getting rated to climb higher.</p>
            <button
              onClick={() => { setShowTierCelebration(false); updateScoreSnapshot() }}
              className="mt-4 text-xs text-muted font-body hover:text-cream transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hero image / banner */}
      <div className="relative w-full h-72 flex-shrink-0 overflow-hidden">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[0].url}
            alt={profile.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Placeholder — no photos yet */
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3a0d12 0%, #1a0508 60%, #0c0a0b 100%)' }}
          >
            <Logo size="xl" className="opacity-30" />
          </div>
        )}

        {/* Bottom dark fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0c0a0b 0%, transparent 100%)' }}
        />

        {/* Sign out — top right */}
        <button
          onClick={() => signOut()}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white text-xs font-body transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>

        {/* Name + location — bottom left */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-cream leading-tight drop-shadow-lg">
              {profile.name}, {profile.age}
            </h1>
            <div className="flex items-center gap-1 text-cream/60 text-sm mt-0.5">
              <MapPin size={12} />
              <span>{profile.city}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TierBadge score={profile.average_score} size="md" />
              {currentStreak > 0 && <StreakBadge streak={currentStreak} size="md" />}
            </div>
          </div>

          {/* Score — bottom right */}
          {profile.rating_count > 0 && (
            <div className="text-right flex-shrink-0 ml-3">
              <div
                className="font-display font-bold text-4xl leading-none drop-shadow-lg"
                style={{ color: TIER_COLORS[tier] }}
              >
                {displayScore(profile.average_score)}
              </div>
              <div className="text-xs text-cream/50 mt-0.5">{profile.rating_count} ratings</div>
            </div>
          )}
        </div>
      </div>

      {/* Here for pill */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-body">Here for</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-rim text-cream/70 font-body">
            {HERE_FOR_LABELS[profile.here_for]}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        {[
          { value: profile.rating_count, label: 'Ratings received' },
          { value: matchCount,           label: 'Matches' },
          { value: ratingsGiven,         label: 'Ratings given' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-surface border border-rim rounded-xl p-3 text-center">
            <div className="font-display font-bold text-xl text-cream">{value}</div>
            <div className="text-xs text-muted font-body leading-tight mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Subscription card */}
      <div
        className="mx-4 mt-5 rounded-2xl border p-4"
        style={{
          borderColor: subscriptionTier === 'free' ? '#2c2228' : `${subscriptionColor}40`,
          background: subscriptionTier === 'free' ? '#1c1618' : `${subscriptionColor}08`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {SubscriptionIcon && <SubscriptionIcon size={16} style={{ color: subscriptionColor }} />}
            <span className="text-sm font-body font-semibold" style={{ color: subscriptionColor }}>
              {subscriptionLabel}
            </span>
          </div>
          {subscriptionTier === 'free' && (
            <Link
              href="/subscribe"
              className="text-xs font-body font-semibold text-[#e8c46a] border border-[#e8c46a]/30 px-2.5 py-1 rounded-lg hover:bg-[#e8c46a]/10 transition-colors"
            >
              Upgrade
            </Link>
          )}
          {subscriptionTier !== 'free' && (
            <Link
              href="/subscribe"
              className="text-xs text-muted font-body hover:text-cream transition-colors"
            >
              Manage
            </Link>
          )}
        </div>
        {subscriptionTier === 'free' && (
          <p className="mt-1.5 text-xs text-muted font-body">
            Upgrade to see who rates you and unlock convince me messages.
          </p>
        )}
      </div>

      {/* Hot streak boost (Premium only) */}
      {subscriptionTier === 'premium' && (
        <HotStreakBanner
          activatedAt={boostActivatedAt}
          usedThisWeek={boostUsedThisWeek && !initialBoostActive}
        />
      )}

      {/* Profile completion quests */}
      {!allQuestsDone && (
        <div className="mx-4 mt-5 bg-surface border border-rim rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#e8c46a]" />
            <h3 className="font-body font-semibold text-cream text-sm">Complete your profile</h3>
            <span className="text-xs text-muted font-body ml-auto">{questsDone}/3</span>
          </div>
          <div className="space-y-2">
            {[
              { done: questPhotos, label: 'Add 3+ photos', hint: 'reaching more people' },
              { done: questPrompts, label: 'Answer both prompts', hint: 'reaching more people' },
              { done: questAge, label: 'Set age preference', hint: 'reaching more people' },
            ].map(({ done, label, hint }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-body ${
                  done
                    ? 'border-[#2db896]/30 bg-[#2db896]/5 text-cream'
                    : 'border-rim bg-bg text-muted'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    done ? 'border-[#2db896] bg-[#2db896]' : 'border-rim'
                  }`}
                >
                  {done && <Check size={10} className="text-bg" strokeWidth={3} />}
                </span>
                <span className="flex-1">{label}</span>
                {done && (
                  <span className="text-[#2db896] flex items-center gap-1 flex-shrink-0">
                    <TrendingUp size={10} /> {hint}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {allQuestsDone && (
        <div className="mx-4 mt-5 rounded-2xl border border-[#2db896]/30 bg-[#2db896]/5 p-4 flex items-center gap-3">
          <span className="text-lg">✓</span>
          <div>
            <p className="text-sm font-body font-semibold text-[#2db896]">Profile complete</p>
            <p className="text-xs text-muted font-body">You&apos;re reaching the maximum number of people.</p>
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="mx-4 mt-5 bg-surface border border-rim rounded-2xl p-4">
        <h3 className="font-body font-semibold text-cream text-sm mb-4">My photos</h3>
        <PhotoGrid initialPhotos={photos} />
      </div>

      {/* Prompts */}
      <div className="mx-4 mt-5 bg-surface border border-rim rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-body font-semibold text-cream text-sm">My prompts</h3>
          {!editingPrompts ? (
            <button
              onClick={() => setEditingPrompts(true)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-cream transition-colors font-body"
            >
              <Pencil size={12} /> Edit
            </button>
          ) : (
            <button
              onClick={cancelPromptEdit}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-cream transition-colors font-body"
            >
              <X size={12} /> Cancel
            </button>
          )}
        </div>

        {!editingPrompts ? (
          /* Display mode */
          savedPrompts.p1q ? (
            <div className="space-y-3">
              {savedPrompts.p1q && savedPrompts.p1a && (
                <div className="bg-bg rounded-xl px-3 py-3 space-y-1">
                  <p className="text-xs text-muted font-body">{savedPrompts.p1q}</p>
                  <p className="text-sm text-cream font-body leading-snug">{savedPrompts.p1a}</p>
                </div>
              )}
              {savedPrompts.p2q && savedPrompts.p2a && (
                <div className="bg-bg rounded-xl px-3 py-3 space-y-1">
                  <p className="text-xs text-muted font-body">{savedPrompts.p2q}</p>
                  <p className="text-sm text-cream font-body leading-snug">{savedPrompts.p2a}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted font-body text-center py-4">
              No prompts set yet. Tap Edit to add them.
            </p>
          )
        ) : (
          /* Edit mode */
          <div className="space-y-3">
            <p className="text-xs text-muted font-body">
              Pick 2 prompts and answer them.{' '}
              <span className="text-accent">{editPicked.length}/2 selected</span>
            </p>

            {PROMPTS.map((q) => {
              const picked = editPicked.includes(q)
              const locked = !picked && editPicked.length >= 2
              return (
                <div key={q} className="space-y-2">
                  <button
                    onClick={() => toggleEditPrompt(q)}
                    disabled={locked}
                    className={`w-full text-left px-3 py-3 rounded-xl border font-body text-xs transition-all flex items-start gap-2.5 ${
                      picked
                        ? 'border-accent bg-accent/15 text-cream'
                        : locked
                        ? 'border-rim bg-bg text-muted/40 cursor-not-allowed'
                        : 'border-rim bg-bg text-muted hover:border-accent/40 hover:text-cream'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                        picked ? 'border-accent bg-accent text-bg' : 'border-rim'
                      }`}
                    >
                      {picked && <Check size={9} strokeWidth={3} />}
                    </span>
                    <span className="leading-snug">{q}</span>
                  </button>

                  {picked && (
                    <textarea
                      value={editAnswers[q] ?? ''}
                      onChange={(e) => setEditAnswers((a) => ({ ...a, [q]: e.target.value }))}
                      placeholder="Your answer…"
                      rows={3}
                      maxLength={280}
                      className="w-full px-3 py-2.5 rounded-xl bg-bg border border-accent/40 text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/70 transition-colors resize-none"
                    />
                  )}
                </div>
              )
            })}

            {promptError && (
              <p className="text-xs text-accent font-body">{promptError}</p>
            )}

            <button
              onClick={handlePromptsSave}
              disabled={savingPrompts}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-cream font-body text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-60 mt-1"
            >
              {savingPrompts ? 'Saving…' : <><Check size={14} /> Save prompts</>}
            </button>
          </div>
        )}
      </div>

      {/* Discover preferences */}
      <div className="mx-4 mt-5 bg-surface border border-rim rounded-2xl p-4">
        <h3 className="font-body font-semibold text-cream text-sm mb-4">Discover preferences</h3>
        <div className="space-y-3">
          <p className="text-xs text-muted font-body">
            Show me people aged{' '}
            <span className="text-cream">{ageMin}–{ageMax === 65 ? '65+' : ageMax}</span>
          </p>
          <AgeRangeSlider
            min={ageMin}
            max={ageMax}
            onChange={(lo, hi) => { setAgeMin(lo); setAgeMax(hi); setAgeSaved(false) }}
          />
          {ageError && (
            <p className="text-xs text-accent font-body">{ageError}</p>
          )}
          <button
            onClick={handleAgeSave}
            disabled={savingAge || ageSaved}
            className={`w-full py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
              ageSaved
                ? 'bg-[#2db896]/20 border border-[#2db896]/40 text-[#2db896]'
                : 'bg-accent text-cream hover:bg-accent/90 disabled:opacity-60'
            }`}
          >
            {savingAge ? 'Saving…' : ageSaved ? '✓ Preferences saved' : 'Save preferences'}
          </button>
        </div>
      </div>

      {/* Tier progress */}
      <div className="mx-4 mt-4 bg-surface border border-rim rounded-2xl p-4">
        <h3 className="font-body font-semibold text-cream text-sm mb-4">Tier progress</h3>
        <TierProgressBar score={profile.average_score} />
      </div>

      {/* Streak perks */}
      <div className="mx-4 mt-4 bg-surface border border-rim rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-body font-semibold text-cream text-sm">Streak perks</h3>
          <span className="text-xs text-muted font-body">{currentStreak} day streak</span>
        </div>

        {perk && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-[#e8c46a]/10 border border-[#e8c46a]/30 text-xs text-[#e8c46a] font-body">
            ✦ Active: {perk}
          </div>
        )}

        <div className="space-y-2">
          {STREAK_PERKS.map(({ days, label, icon }) => {
            const unlocked = currentStreak >= days
            return (
              <div
                key={days}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-body transition-colors ${
                  unlocked
                    ? 'border-[#e8c46a]/40 bg-[#e8c46a]/8 text-cream'
                    : 'border-rim bg-bg text-muted'
                }`}
              >
                <span className="text-base">{icon}</span>
                <div className="flex-1">
                  <span className={unlocked ? 'text-cream' : 'text-muted'}>{label}</span>
                </div>
                <span className={`flex-shrink-0 ${unlocked ? 'text-[#e8c46a]' : 'text-rim'}`}>
                  {unlocked ? '✓' : `${days}d`}
                </span>
              </div>
            )
          })}
        </div>

        {nextPerk && (
          <p className="mt-3 text-xs text-muted font-body text-center">
            {nextPerk.days - currentStreak} more days to unlock: {nextPerk.perk}
          </p>
        )}
      </div>

      {/* Daily confidence */}
      <div className="mx-4 mt-4 bg-surface border border-rim rounded-2xl p-4">
        <h3 className="font-body font-semibold text-cream text-sm mb-3">Daily confidence</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: `hsl(${(confidence - 1) * 14}, 60%, 55%)` }}
            >
              <span
                className="font-display font-bold text-lg"
                style={{ color: `hsl(${(confidence - 1) * 14}, 60%, 65%)` }}
              >
                {confidence}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={confidence}
              onChange={(e) => { setConfidence(parseInt(e.target.value)); setConfSaved(false) }}
              className="flex-1 accent-accent"
            />
          </div>

          <button
            onClick={handleConfidenceSave}
            disabled={savingConf || confSaved}
            className={`w-full py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
              confSaved
                ? 'bg-[#2db896]/20 border border-[#2db896]/40 text-[#2db896]'
                : 'bg-accent text-cream hover:bg-accent/90 disabled:opacity-60'
            }`}
          >
            {savingConf ? 'Saving…' : confSaved ? '✓ Confidence saved for today' : 'Save today\'s confidence'}
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="mx-4 mt-4 bg-surface border border-rim rounded-2xl p-4 space-y-2">
        <h3 className="font-body font-semibold text-cream text-sm mb-1">Account</h3>
        <div className="text-xs text-muted font-body">{email}</div>
        <div className="text-xs text-muted font-body">
          Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  )
}
