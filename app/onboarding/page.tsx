'use client'

import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { completeOnboarding } from '@/lib/actions'
import { OnboardingPhotoGrid } from '@/components/OnboardingPhotoGrid'
import type { OnboardingPhoto } from '@/components/OnboardingPhotoGrid'
import { HERE_FOR_LABELS, PROMPTS } from '@/types'
import type { HereFor } from '@/types'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const HERE_FOR_OPTIONS: HereFor[] = [
  'post-breakup-reset',
  'boredom-curiosity',
  'actually-dating',
  'confidence-building',
]

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [name, setName]   = useState('')
  const [age, setAge]     = useState('')
  const [city, setCity]   = useState('')

  // Step 2
  const [onboardingPhotos, setOnboardingPhotos] = useState<OnboardingPhoto[]>([])

  // Step 3
  const [hereFor, setHereFor] = useState<HereFor | ''>('')

  // Step 4 — prompts
  const [pickedPrompts, setPickedPrompts] = useState<string[]>([])
  const [promptAnswers, setPromptAnswers] = useState<Record<string, string>>({})

  // Step 5
  const [confidence, setConfidence] = useState(7)

  function togglePrompt(q: string) {
    if (pickedPrompts.includes(q)) {
      setPickedPrompts((p) => p.filter((x) => x !== q))
    } else if (pickedPrompts.length < 2) {
      setPickedPrompts((p) => [...p, q])
    }
  }

  function setAnswer(q: string, val: string) {
    setPromptAnswers((a) => ({ ...a, [q]: val }))
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)

    // Photos are already uploaded to storage by OnboardingPhotoGrid —
    // completeOnboarding writes them to user_photos atomically with the profile.
    const result = await completeOnboarding({
      name: name.trim(),
      age: parseInt(age),
      city: city.trim(),
      here_for: hereFor as HereFor,
      photos: onboardingPhotos,
      confidence_score: confidence,
      prompt_1_question: pickedPrompts[0] ?? null,
      prompt_1_answer: (promptAnswers[pickedPrompts[0]] ?? '').trim() || null,
      prompt_2_question: pickedPrompts[1] ?? null,
      prompt_2_answer: (promptAnswers[pickedPrompts[1]] ?? '').trim() || null,
    })

    setLoading(false)
    if (result?.error) setError(result.error)
  }

  function nextStep() {
    setError(null)
    if (step === 1 && (!name.trim() || !age || !city.trim())) {
      setError('Please fill in all fields')
      return
    }
    if (step === 3 && !hereFor) {
      setError('Please select an option')
      return
    }
    if (step === 4) {
      if (pickedPrompts.length < 2) {
        setError('Please pick 2 prompts')
        return
      }
      if (pickedPrompts.some((q) => !(promptAnswers[q] ?? '').trim())) {
        setError('Please answer both prompts')
        return
      }
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="flex justify-center py-8">
        <Logo size="lg" />
      </header>

      {/* Progress bar */}
      <div className="px-6 max-w-sm mx-auto w-full mb-8">
        <div className="flex justify-between text-xs text-muted font-body mb-2">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-rim overflow-hidden">
          <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="flex-1 px-6 pb-24 max-w-sm mx-auto w-full">
        <div className="animate-fade-in-up">

          {/* ── Step 1: Basic info ─────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-cream mb-1">Who are you?</h2>
                <p className="text-muted font-body text-sm">Let&apos;s set up your profile.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted font-body uppercase tracking-wide">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-rim text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/60 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted font-body uppercase tracking-wide">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="18–99"
                      min={18}
                      max={99}
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-rim text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/60 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted font-body uppercase tracking-wide">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-rim text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/60 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Photos ─────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-cream mb-1">Add photos</h2>
                <p className="text-muted font-body text-sm">
                  Up to 10. Optional, but it really helps.
                </p>
              </div>
              <OnboardingPhotoGrid onChange={setOnboardingPhotos} />
            </div>
          )}

          {/* ── Step 3: Here for ──────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-cream mb-1">Why are you here?</h2>
                <p className="text-muted font-body text-sm">Be honest. It shows on your profile.</p>
              </div>
              <div className="space-y-3">
                {HERE_FOR_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => setHereFor(option)}
                    className={`w-full text-left px-4 py-4 rounded-xl border font-body text-sm transition-all ${
                      hereFor === option
                        ? 'border-accent bg-accent/15 text-cream'
                        : 'border-rim bg-surface text-muted hover:border-accent/40 hover:text-cream'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{HERE_FOR_LABELS[option]}</span>
                      {hereFor === option && <span className="text-accent text-base">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Prompts ───────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-cream mb-1">Your prompts</h2>
                <p className="text-muted font-body text-sm">
                  Pick 2 and answer them — this is what people see first.{' '}
                  <span className="text-accent">{pickedPrompts.length}/2 selected</span>
                </p>
              </div>

              <div className="space-y-3">
                {PROMPTS.map((q) => {
                  const picked = pickedPrompts.includes(q)
                  const locked = !picked && pickedPrompts.length >= 2

                  return (
                    <div key={q} className="space-y-2">
                      <button
                        onClick={() => togglePrompt(q)}
                        disabled={locked}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border font-body text-sm transition-all flex items-start gap-3 ${
                          picked
                            ? 'border-accent bg-accent/15 text-cream'
                            : locked
                            ? 'border-rim bg-surface text-muted/40 cursor-not-allowed'
                            : 'border-rim bg-surface text-muted hover:border-accent/40 hover:text-cream'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border text-[10px] transition-all ${
                            picked ? 'border-accent bg-accent text-bg' : 'border-rim'
                          }`}
                        >
                          {picked && <Check size={10} strokeWidth={3} />}
                        </span>
                        <span className="leading-snug">{q}</span>
                      </button>

                      {picked && (
                        <textarea
                          value={promptAnswers[q] ?? ''}
                          onChange={(e) => setAnswer(q, e.target.value)}
                          placeholder="Your answer…"
                          rows={3}
                          maxLength={280}
                          className="w-full px-4 py-3 rounded-xl bg-surface border border-accent/40 text-cream placeholder-muted font-body text-sm outline-none focus:border-accent/70 transition-colors resize-none"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 5: Daily confidence ──────────────── */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-cream mb-1">
                  Confidence check-in
                </h2>
                <p className="text-muted font-body text-sm">
                  How confident are you feeling today? (1–10)
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div
                    className="w-24 h-24 rounded-full border-4 flex items-center justify-center"
                    style={{ borderColor: `hsl(${(confidence - 1) * 14}, 70%, 55%)` }}
                  >
                    <span
                      className="font-display font-black text-4xl"
                      style={{ color: `hsl(${(confidence - 1) * 14}, 70%, 65%)` }}
                    >
                      {confidence}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full accent-accent"
                />

                <div className="flex justify-between text-xs text-muted font-body">
                  <span>Not feeling it</span>
                  <span>Unstoppable</span>
                </div>

                <div className="bg-surface border border-rim rounded-xl p-4">
                  <p className="text-xs text-muted font-body leading-relaxed">
                    Your confidence rating is public on your profile and resets daily.
                    It doesn&apos;t affect your match score — just your vibe.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm font-body text-accent bg-accent/10 border border-accent/30 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-rim text-muted font-body text-sm hover:text-cream hover:border-cream/30 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={step < TOTAL_STEPS ? nextStep : handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-accent text-cream font-body font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving…' : step < TOTAL_STEPS ? (
                <><span>Continue</span><ChevronRight size={16} /></>
              ) : (
                'Start exploring'
              )}
            </button>
          </div>

          {/* Skip photo step */}
          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="w-full mt-3 text-sm text-muted font-body hover:text-cream transition-colors py-2"
            >
              Skip for now
            </button>
          )}

          {/* Skip prompts step */}
          {step === 4 && (
            <button
              onClick={() => { setPickedPrompts([]); setPromptAnswers({}); setStep(5) }}
              className="w-full mt-3 text-sm text-muted font-body hover:text-cream transition-colors py-2"
            >
              Skip for now
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
