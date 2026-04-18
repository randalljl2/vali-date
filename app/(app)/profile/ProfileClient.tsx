'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PhotoGrid } from '@/components/PhotoGrid'
import { AgeRangeSlider } from '@/components/AgeRangeSlider'
import { HeightPicker } from '@/components/HeightPicker'
import {
  signOut, updateDailyConfidence, updateUserPrompts,
  updateAgePreference, updateGenderPreference, updateHeight,
  updateCompatibilityThreshold,
} from '@/lib/actions'
import { formatHeight } from '@/lib/utils'
import { HERE_FOR_LABELS, PROMPTS, GENDER_LABELS, SHOW_ME_LABELS } from '@/types'
import type { UserProfile, UserPhoto, DailyConfidence, Gender, ShowMe } from '@/types'
import { LogOut, Pencil, X, Check, BookOpen, Zap } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface Props {
  profile: UserProfile
  photos: UserPhoto[]
  todayConfidence: DailyConfidence | null
  matchCount: number
  answersCount: number
  email: string
}

export function ProfileClient({
  profile,
  photos,
  todayConfidence,
  matchCount,
  answersCount,
  email,
}: Props) {
  const [confidence, setConfidence] = useState(todayConfidence?.score ?? 7)
  const [savingConf, setSavingConf] = useState(false)
  const [confSaved, setConfSaved] = useState(!!todayConfidence)

  // Prompts state
  const [editingPrompts, setEditingPrompts] = useState(false)
  const [editPicked, setEditPicked] = useState<string[]>(
    [profile.prompt_1_question, profile.prompt_2_question].filter(Boolean) as string[]
  )
  const [editAnswers, setEditAnswers] = useState<Record<string, string>>({
    ...(profile.prompt_1_question ? { [profile.prompt_1_question]: profile.prompt_1_answer ?? '' } : {}),
    ...(profile.prompt_2_question ? { [profile.prompt_2_question]: profile.prompt_2_answer ?? '' } : {}),
  })
  const [savingPrompts, setSavingPrompts] = useState(false)
  const [promptError, setPromptError] = useState<string | null>(null)
  const [savedPrompts, setSavedPrompts] = useState({
    p1q: profile.prompt_1_question,
    p1a: profile.prompt_1_answer,
    p2q: profile.prompt_2_question,
    p2a: profile.prompt_2_answer,
  })

  // Age preference
  const [ageMin, setAgeMin] = useState(profile.preferred_age_min ?? 18)
  const [ageMax, setAgeMax] = useState(profile.preferred_age_max ?? 65)
  const [savingAge, setSavingAge] = useState(false)
  const [ageSaved, setAgeSaved] = useState(false)
  const [ageError, setAgeError] = useState<string | null>(null)

  // Height
  const [editHeight, setEditHeight] = useState<number | null>(profile.height_cm ?? null)
  const [savingHeight, setSavingHeight] = useState(false)
  const [heightSaved, setHeightSaved] = useState(false)
  const [heightError, setHeightError] = useState<string | null>(null)

  // Compatibility threshold
  const [threshold, setThreshold] = useState(profile.min_compatibility_threshold ?? 0)
  const [savingThreshold, setSavingThreshold] = useState(false)
  const [thresholdSaved, setThresholdSaved] = useState(false)

  // Gender & showMe
  const [editGender, setEditGender] = useState<Gender | ''>(profile.gender ?? '')
  const [editShowMe, setEditShowMe] = useState<ShowMe>(profile.show_me ?? 'everyone')
  const [savingGender, setSavingGender] = useState(false)
  const [genderSaved, setGenderSaved] = useState(false)
  const [genderError, setGenderError] = useState<string | null>(null)

  const isPaid = profile.subscription_tier !== 'free'

  async function handleHeightSave() {
    setSavingHeight(true)
    setHeightError(null)
    const result = await updateHeight(editHeight)
    setSavingHeight(false)
    if ('error' in result) { setHeightError(result.error); return }
    setHeightSaved(true)
    setTimeout(() => setHeightSaved(false), 2500)
  }

  async function handleGenderSave() {
    if (!editGender) { setGenderError('Please select your gender'); return }
    setSavingGender(true)
    setGenderError(null)
    const result = await updateGenderPreference(editGender as Gender, editShowMe)
    setSavingGender(false)
    if ('error' in result) { setGenderError(result.error); return }
    setGenderSaved(true)
    setTimeout(() => setGenderSaved(false), 2500)
  }

  async function handleThresholdSave(value: number) {
    setThreshold(value)
    setSavingThreshold(true)
    await updateCompatibilityThreshold(value)
    setSavingThreshold(false)
    setThresholdSaved(true)
    setTimeout(() => setThresholdSaved(false), 2500)
  }

  async function handleAgeSave() {
    setSavingAge(true)
    setAgeError(null)
    const result = await updateAgePreference(ageMin, ageMax)
    setSavingAge(false)
    if ('error' in result) { setAgeError(result.error); return }
    setAgeSaved(true)
    setTimeout(() => setAgeSaved(false), 2500)
  }

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
    <div className="flex flex-col min-h-screen pb-6 bg-bg">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <Logo size="md" />
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-xs text-muted font-body hover:text-ink-2 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>

      {/* Profile hero */}
      <div className="mx-4 bg-surface border border-border rounded-2xl overflow-hidden">
        {photos.length > 0 ? (
          <div className="relative w-full aspect-[3/2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[0].url}
              alt={profile.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
            />
            <div className="absolute bottom-4 left-4">
              <h1 className="font-display font-bold text-2xl text-white leading-tight">
                {profile.name}, {profile.age}
              </h1>
              <p className="text-white/70 font-body text-sm">{profile.city}</p>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[3/2] bg-border-soft flex items-center justify-center">
            <Logo size="xl" />
          </div>
        )}
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full border border-border-soft bg-bg text-muted font-body">
            {HERE_FOR_LABELS[profile.here_for]}
          </span>
          {profile.height_cm && (
            <span className="text-xs px-2.5 py-1 rounded-full border border-border-soft bg-bg text-muted font-body">
              {formatHeight(profile.height_cm)}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        {[
          { value: matchCount, label: 'Matches' },
          { value: answersCount, label: 'Questions answered' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-3 text-center">
            <div className="font-display font-bold text-2xl text-ink">{value}</div>
            <div className="text-xs text-muted font-body mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Questions CTA */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-accent" />
          </div>
          <div>
            <p className="font-body font-semibold text-ink text-sm">Answer more questions</p>
            <p className="text-xs text-muted font-body">Better answers = better matches</p>
          </div>
        </div>
        <Link
          href="/questions"
          className="text-xs font-body font-medium text-accent border border-accent/30 px-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors flex-shrink-0"
        >
          Open
        </Link>
      </div>

      {/* Subscription */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isPaid && <Zap size={14} className="text-accent flex-shrink-0" />}
          <div>
            <p className="font-body font-semibold text-ink text-sm">
              {isPaid ? 'ValiDate Plus' : 'Free plan'}
            </p>
            {!isPaid && (
              <p className="text-xs text-muted font-body">Upgrade to unlock premium features</p>
            )}
          </div>
        </div>
        <Link
          href="/subscribe"
          className="text-xs font-body text-muted hover:text-ink-2 transition-colors flex-shrink-0"
        >
          {isPaid ? 'Manage' : 'Upgrade →'}
        </Link>
      </div>

      {/* Photos */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
        <h3 className="font-body font-semibold text-ink text-sm mb-4">My photos</h3>
        <PhotoGrid initialPhotos={photos} />
      </div>

      {/* Prompts */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-body font-semibold text-ink text-sm">My prompts</h3>
          {!editingPrompts ? (
            <button
              onClick={() => setEditingPrompts(true)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-ink-2 transition-colors font-body"
            >
              <Pencil size={12} /> Edit
            </button>
          ) : (
            <button
              onClick={cancelPromptEdit}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-ink-2 transition-colors font-body"
            >
              <X size={12} /> Cancel
            </button>
          )}
        </div>

        {!editingPrompts ? (
          savedPrompts.p1q ? (
            <div className="space-y-3">
              {savedPrompts.p1q && savedPrompts.p1a && (
                <div className="bg-bg rounded-xl px-4 py-3 space-y-1 border border-border-soft">
                  <p className="text-xs text-muted font-body">{savedPrompts.p1q}</p>
                  <p className="text-sm text-ink-2 font-serif italic leading-snug">{savedPrompts.p1a}</p>
                </div>
              )}
              {savedPrompts.p2q && savedPrompts.p2a && (
                <div className="bg-bg rounded-xl px-4 py-3 space-y-1 border border-border-soft">
                  <p className="text-xs text-muted font-body">{savedPrompts.p2q}</p>
                  <p className="text-sm text-ink-2 font-serif italic leading-snug">{savedPrompts.p2a}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted font-body text-center py-4">No prompts set yet. Tap Edit to add them.</p>
          )
        ) : (
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
                        ? 'border-accent bg-accent/8 text-ink'
                        : locked
                        ? 'border-border bg-bg text-muted/40 cursor-not-allowed'
                        : 'border-border bg-bg text-muted hover:border-accent/40 hover:text-ink'
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
                        picked ? 'border-accent bg-accent text-white' : 'border-border'
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
                      className="w-full px-3 py-2.5 rounded-xl bg-bg border border-accent/30 text-ink placeholder-muted font-body text-sm outline-none focus:border-accent transition-colors resize-none"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white font-body text-sm font-medium hover:bg-accent-soft transition-colors disabled:opacity-60"
            >
              {savingPrompts ? 'Saving…' : <><Check size={14} /> Save prompts</>}
            </button>
          </div>
        )}
      </div>

      {/* Height */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
        <h3 className="font-body font-semibold text-ink text-sm mb-4">Height</h3>
        <div className="space-y-3">
          <HeightPicker
            value={editHeight}
            onChange={(v) => { setEditHeight(v); setHeightSaved(false) }}
          />
          {editHeight !== null && (
            <p className="text-xs text-muted font-body text-center">{formatHeight(editHeight)}</p>
          )}
          {heightError && <p className="text-xs text-accent font-body">{heightError}</p>}
          <button
            onClick={handleHeightSave}
            disabled={savingHeight || heightSaved}
            className={`w-full py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
              heightSaved
                ? 'bg-[#2a7d5f]/15 border border-[#2a7d5f]/30 text-[#2a7d5f]'
                : 'bg-accent text-white hover:bg-accent-soft disabled:opacity-60'
            }`}
          >
            {savingHeight ? 'Saving…' : heightSaved ? '✓ Height saved' : 'Save height'}
          </button>
        </div>
      </div>

      {/* Gender & preference */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
        <h3 className="font-body font-semibold text-ink text-sm mb-4">Gender &amp; preference</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-muted font-body">I am a</p>
            <div className="grid grid-cols-2 gap-2">
              {(['man', 'woman', 'non-binary', 'prefer-not-to-say'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => { setEditGender(g); setGenderSaved(false) }}
                  className={`py-2.5 px-3 rounded-xl border font-body text-xs transition-all text-left flex items-center justify-between ${
                    editGender === g
                      ? 'border-accent bg-accent/8 text-ink'
                      : 'border-border bg-bg text-muted hover:border-accent/30 hover:text-ink'
                  }`}
                >
                  <span>{GENDER_LABELS[g]}</span>
                  {editGender === g && <Check size={12} className="text-accent flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted font-body">Show me</p>
            <div className="grid grid-cols-3 gap-2">
              {(['men', 'women', 'everyone'] as ShowMe[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setEditShowMe(s); setGenderSaved(false) }}
                  className={`py-2.5 rounded-xl border font-body text-xs transition-all ${
                    editShowMe === s
                      ? 'border-accent bg-accent/8 text-ink'
                      : 'border-border bg-bg text-muted hover:border-accent/30 hover:text-ink'
                  }`}
                >
                  {SHOW_ME_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {genderError && <p className="text-xs text-accent font-body">{genderError}</p>}

          <button
            onClick={handleGenderSave}
            disabled={savingGender || genderSaved}
            className={`w-full py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
              genderSaved
                ? 'bg-[#2a7d5f]/15 border border-[#2a7d5f]/30 text-[#2a7d5f]'
                : 'bg-accent text-white hover:bg-accent-soft disabled:opacity-60'
            }`}
          >
            {savingGender ? 'Saving…' : genderSaved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Discover preferences */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
        <h3 className="font-body font-semibold text-ink text-sm mb-4">Discover preferences</h3>
        <div className="space-y-3">
          <p className="text-xs text-muted font-body">
            Show me people aged{' '}
            <span className="text-ink">{ageMin}–{ageMax === 65 ? '65+' : ageMax}</span>
          </p>
          <AgeRangeSlider
            min={ageMin}
            max={ageMax}
            onChange={(lo, hi) => { setAgeMin(lo); setAgeMax(hi); setAgeSaved(false) }}
          />
          {ageError && <p className="text-xs text-accent font-body">{ageError}</p>}
          <button
            onClick={handleAgeSave}
            disabled={savingAge || ageSaved}
            className={`w-full py-2.5 rounded-xl text-sm font-body font-medium transition-colors ${
              ageSaved
                ? 'bg-[#2a7d5f]/15 border border-[#2a7d5f]/30 text-[#2a7d5f]'
                : 'bg-accent text-white hover:bg-accent-soft disabled:opacity-60'
            }`}
          >
            {savingAge ? 'Saving…' : ageSaved ? '✓ Preferences saved' : 'Save preferences'}
          </button>
        </div>
      </div>

      {/* Compatibility threshold */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
        <h3 className="font-body font-semibold text-ink text-sm mb-1">Minimum compatibility</h3>
        <p className="text-xs text-muted font-body mb-4">
          Only show profiles that meet this threshold. Profiles with fewer than 10 shared answers
          are always hidden when a minimum is set.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {([
            { value: 0,  label: 'No minimum',  sub: 'Show everyone' },
            { value: 50, label: '50%+',         sub: 'Some alignment' },
            { value: 60, label: '60%+',         sub: 'Good match' },
            { value: 70, label: '70%+',         sub: 'Strong match' },
            { value: 80, label: '80%+',         sub: 'Exceptional match' },
          ] as const).map(({ value, label, sub }) => {
            const isSelected = threshold === value
            return (
              <button
                key={value}
                onClick={() => !savingThreshold && handleThresholdSave(value)}
                disabled={savingThreshold}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/8 text-ink'
                    : 'border-border bg-bg text-muted hover:border-accent/30 hover:text-ink'
                }`}
              >
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{sub}</span>
                  {isSelected && (
                    savingThreshold
                      ? <span className="text-[10px] text-muted font-body">Saving…</span>
                      : thresholdSaved
                      ? <Check size={13} className="text-[#2a7d5f]" />
                      : <Check size={13} className="text-accent" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Daily confidence */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4">
        <h3 className="font-body font-semibold text-ink text-sm mb-3">Daily confidence</h3>
        <p className="text-xs text-muted font-body mb-4">
          How confident do you feel today? This shows on your profile for matches to see.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: `hsl(${(confidence - 1) * 14}, 50%, 50%)` }}
            >
              <span
                className="font-display font-bold text-lg"
                style={{ color: `hsl(${(confidence - 1) * 14}, 50%, 40%)` }}
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
                ? 'bg-[#2a7d5f]/15 border border-[#2a7d5f]/30 text-[#2a7d5f]'
                : 'bg-accent text-white hover:bg-accent-soft disabled:opacity-60'
            }`}
          >
            {savingConf ? 'Saving…' : confSaved ? '✓ Confidence saved for today' : "Save today's confidence"}
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4 space-y-2">
        <h3 className="font-body font-semibold text-ink text-sm mb-1">Account</h3>
        <div className="text-xs text-muted font-body">{email}</div>
        <div className="text-xs text-muted font-body">
          Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  )
}
