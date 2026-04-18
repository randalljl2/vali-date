'use client'

import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { completeOnboarding } from '@/lib/actions'
import { OnboardingPhotoGrid } from '@/components/OnboardingPhotoGrid'
import type { OnboardingPhoto } from '@/components/OnboardingPhotoGrid'
import { HERE_FOR_LABELS, PROMPTS, GENDER_LABELS, SHOW_ME_LABELS } from '@/types'
import type { HereFor, Gender, ShowMe } from '@/types'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { HeightPicker } from '@/components/HeightPicker'
import { getSetQuestions } from '@/lib/questions'

const HERE_FOR_OPTIONS: HereFor[]  = ['post-breakup-reset', 'boredom-curiosity', 'actually-dating', 'confidence-building']
const GENDER_OPTIONS: Gender[]     = ['man', 'woman', 'non-binary', 'prefer-not-to-say']
const SHOW_ME_OPTIONS: ShowMe[]    = ['men', 'women', 'everyone']
const IMPORTANCE_LABELS            = ['Nice to know', 'Matters to me', 'Deal-breaker'] as const
const SET_ONE_QUESTIONS            = getSetQuestions(1)
const TOTAL_STEPS                  = 6

type QuestionAnswer = { answer: 'a' | 'b' | 'c'; importance: 1 | 2 | 3 }

export default function OnboardingPage() {
  const [step, setStep]     = useState(1)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [name, setName]         = useState('')
  const [age, setAge]           = useState('')
  const [city, setCity]         = useState('')
  const [heightCm, setHeightCm] = useState<number | null>(null)

  // Step 2
  const [photos, setPhotos] = useState<OnboardingPhoto[]>([])

  // Step 3
  const [gender, setGender]   = useState<Gender | ''>('')
  const [showMe, setShowMe]   = useState<ShowMe>('everyone')

  // Step 4
  const [hereFor, setHereFor] = useState<HereFor | ''>('')

  // Step 5
  const [pickedPrompts, setPickedPrompts]   = useState<string[]>([])
  const [promptAnswers, setPromptAnswers]   = useState<Record<string, string>>({})

  // Step 6 — Set 1 questions
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, QuestionAnswer>>({})
  const [confidence, setConfidence]           = useState(7)

  function togglePrompt(q: string) {
    if (pickedPrompts.includes(q)) {
      setPickedPrompts(p => p.filter(x => x !== q))
    } else if (pickedPrompts.length < 2) {
      setPickedPrompts(p => [...p, q])
    }
  }

  function setQAnswer(qNum: number, field: 'answer' | 'importance', value: string | number) {
    setQuestionAnswers(prev => ({
      ...prev,
      [qNum]: { ...(prev[qNum] ?? { answer: undefined, importance: undefined }), [field]: value },
    }))
  }

  const allQuestionsAnswered = SET_ONE_QUESTIONS.every(q => {
    const a = questionAnswers[q.number]
    return a?.answer && a?.importance
  })

  function nextStep() {
    setError(null)
    if (step === 1) {
      if (!name.trim()) { setError('Please enter your name'); return }
      if (!age || parseInt(age) < 18 || parseInt(age) > 99) { setError('Please enter a valid age (18–99)'); return }
      if (!city.trim()) { setError('Please enter your city'); return }
    }
    if (step === 3 && !gender) { setError('Please select your gender'); return }
    if (step === 4 && !hereFor) { setError('Please select an option'); return }
    if (step === 5) {
      if (pickedPrompts.length < 2) { setError('Please pick 2 prompts'); return }
      if (pickedPrompts.some(q => !(promptAnswers[q] ?? '').trim())) { setError('Please answer both prompts'); return }
    }
    if (step === 6 && !allQuestionsAnswered) {
      setError('Please answer all 25 questions and set an importance for each')
      return
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  async function handleSubmit() {
    if (!allQuestionsAnswered) { setError('Please answer all 25 questions'); return }
    setError(null)
    setLoading(true)

    const result = await completeOnboarding({
      name: name.trim(),
      age: parseInt(age),
      city: city.trim(),
      here_for: hereFor as HereFor,
      gender: gender as Gender,
      show_me: showMe,
      height_cm: heightCm,
      photos,
      confidence_score: confidence,
      prompt_1_question: pickedPrompts[0] ?? null,
      prompt_1_answer: (promptAnswers[pickedPrompts[0]] ?? '').trim() || null,
      prompt_2_question: pickedPrompts[1] ?? null,
      prompt_2_answer: (promptAnswers[pickedPrompts[1]] ?? '').trim() || null,
      set_one_answers: SET_ONE_QUESTIONS.map(q => ({
        question_number: q.number,
        answer: questionAnswers[q.number]!.answer,
        importance: questionAnswers[q.number]!.importance,
      })),
    })

    setLoading(false)
    if (result?.error) setError(result.error)
  }

  const progress = (step / TOTAL_STEPS) * 100

  // Button label
  const isLastStep = step === TOTAL_STEPS
  const btnLabel = loading
    ? 'Saving…'
    : isLastStep
    ? 'Start exploring'
    : 'Continue'

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="flex justify-center py-8">
        <Logo size="lg" />
      </header>

      {/* Progress */}
      <div className="px-6 max-w-sm mx-auto w-full mb-8">
        <div className="flex justify-between text-xs text-muted font-body mb-2">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full rounded-full bg-border overflow-hidden">
          <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <main className="flex-1 px-6 pb-28 max-w-sm mx-auto w-full">
        <div className="animate-fade-in-up">

          {/* ── Step 1: Basic info ─────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink mb-1">Who are you?</h2>
                <p className="text-muted font-body text-sm">Let&apos;s start with the basics.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted font-body uppercase tracking-wider">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your first name" className="field" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted font-body uppercase tracking-wider">Age</label>
                    <input type="number" value={age} onChange={e => setAge(e.target.value)}
                      placeholder="18–99" min={18} max={99} className="field" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted font-body uppercase tracking-wider">City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)}
                      placeholder="Your city" className="field" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted font-body uppercase tracking-wider">
                    Height <span className="normal-case tracking-normal text-muted/60">(optional)</span>
                  </label>
                  <HeightPicker value={heightCm} onChange={setHeightCm} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Photos ─────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink mb-1">Add photos</h2>
                <p className="text-muted font-body text-sm">Up to 10. Your first photo is your primary.</p>
              </div>
              <OnboardingPhotoGrid onChange={setPhotos} />
            </div>
          )}

          {/* ── Step 3: Identity ───────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink mb-1">About you</h2>
                <p className="text-muted font-body text-sm">Personalises your discover feed.</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted font-body uppercase tracking-wider">I am a</p>
                <div className="space-y-2">
                  {GENDER_OPTIONS.map(g => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border font-body text-sm transition-all flex items-center justify-between ${
                        gender === g
                          ? 'border-accent bg-accent/8 text-ink'
                          : 'border-border bg-surface text-ink-2 hover:border-accent/40'
                      }`}>
                      <span>{GENDER_LABELS[g]}</span>
                      {gender === g && <Check size={14} className="text-accent" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted font-body uppercase tracking-wider">Show me</p>
                <div className="grid grid-cols-3 gap-2">
                  {SHOW_ME_OPTIONS.map(s => (
                    <button key={s} onClick={() => setShowMe(s)}
                      className={`py-3 rounded-xl border font-body text-sm transition-all ${
                        showMe === s
                          ? 'border-accent bg-accent/8 text-ink'
                          : 'border-border bg-surface text-ink-2 hover:border-accent/40'
                      }`}>
                      {SHOW_ME_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Here for ───────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink mb-1">Why are you here?</h2>
                <p className="text-muted font-body text-sm">Be honest. It shows on your profile.</p>
              </div>
              <div className="space-y-3">
                {HERE_FOR_OPTIONS.map(option => (
                  <button key={option} onClick={() => setHereFor(option)}
                    className={`w-full text-left px-4 py-4 rounded-xl border font-body text-sm transition-all flex items-center justify-between ${
                      hereFor === option
                        ? 'border-accent bg-accent/8 text-ink'
                        : 'border-border bg-surface text-ink-2 hover:border-accent/40'
                    }`}>
                    <span>{HERE_FOR_LABELS[option]}</span>
                    {hereFor === option && <Check size={14} className="text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 5: Prompts ────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink mb-1">Your prompts</h2>
                <p className="text-muted font-body text-sm">
                  Pick 2 and answer them.{' '}
                  <span className="text-accent">{pickedPrompts.length}/2 selected</span>
                </p>
              </div>

              <div className="space-y-3">
                {PROMPTS.map(q => {
                  const picked = pickedPrompts.includes(q)
                  const locked = !picked && pickedPrompts.length >= 2
                  return (
                    <div key={q} className="space-y-2">
                      <button onClick={() => togglePrompt(q)} disabled={locked}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border font-body text-sm transition-all flex items-start gap-3 ${
                          picked ? 'border-accent bg-accent/8 text-ink'
                          : locked ? 'border-border-soft bg-bg text-muted/50 cursor-not-allowed'
                          : 'border-border bg-surface text-ink-2 hover:border-accent/40'
                        }`}>
                        <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border text-[10px] transition-all ${
                          picked ? 'border-accent bg-accent text-white' : 'border-border'
                        }`}>
                          {picked && <Check size={10} strokeWidth={3} />}
                        </span>
                        <span className="leading-snug">{q}</span>
                      </button>
                      {picked && (
                        <textarea
                          value={promptAnswers[q] ?? ''}
                          onChange={e => setPromptAnswers(a => ({ ...a, [q]: e.target.value }))}
                          placeholder="Your answer…"
                          rows={3} maxLength={280}
                          className="w-full px-4 py-3 rounded-xl bg-surface border border-accent/30 text-ink placeholder-muted font-body text-sm outline-none focus:border-accent transition-colors resize-none"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Step 6: Set 1 Questions ────────────────────── */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-ink mb-1">Core questions</h2>
                <p className="text-muted font-body text-sm leading-relaxed">
                  Answer all 25 honestly — these power your compatibility score. For each question,
                  select your answer and how much it matters to you in a partner.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(Object.keys(questionAnswers).filter(k => questionAnswers[parseInt(k)]?.answer && questionAnswers[parseInt(k)]?.importance).length / 25) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted font-body flex-shrink-0">
                    {Object.keys(questionAnswers).filter(k => questionAnswers[parseInt(k)]?.answer && questionAnswers[parseInt(k)]?.importance).length}/25
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {SET_ONE_QUESTIONS.map(q => {
                  const ans = questionAnswers[q.number]
                  const answered = !!(ans?.answer && ans?.importance)
                  return (
                    <div
                      key={q.number}
                      className={`rounded-2xl border p-4 space-y-4 transition-colors ${
                        answered ? 'border-accent/25 bg-surface' : 'border-border bg-surface'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-display font-bold text-accent text-lg leading-none flex-shrink-0 mt-0.5">
                          {q.number}
                        </span>
                        <p className="font-body text-sm text-ink leading-snug">{q.text}</p>
                      </div>

                      {/* Answer options */}
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted font-body">Your answer</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {(['a', 'b', 'c'] as const).map(opt => {
                            const label = q[opt]
                            const selected = ans?.answer === opt
                            return (
                              <button
                                key={opt}
                                onClick={() => setQAnswer(q.number, 'answer', opt)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs font-body transition-all flex items-center gap-2 ${
                                  selected
                                    ? 'border-accent bg-accent/8 text-ink font-medium'
                                    : 'border-border bg-bg text-muted hover:border-accent/40 hover:text-ink-2'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                                  selected ? 'border-accent bg-accent' : 'border-border'
                                }`}>
                                  {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                {label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Importance */}
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted font-body">How much does this matter to you?</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {([1, 2, 3] as const).map(imp => {
                            const selected = ans?.importance === imp
                            return (
                              <button
                                key={imp}
                                onClick={() => setQAnswer(q.number, 'importance', imp)}
                                className={`py-2 px-1 rounded-lg border text-[10px] font-body text-center transition-all leading-tight ${
                                  selected
                                    ? 'border-accent bg-accent/8 text-accent font-medium'
                                    : 'border-border bg-bg text-muted hover:border-accent/40 hover:text-ink-2'
                                }`}
                              >
                                {IMPORTANCE_LABELS[imp - 1]}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Confidence */}
              <div className="rounded-2xl border border-border bg-surface p-4 space-y-4">
                <div>
                  <h3 className="font-body font-medium text-ink text-sm">Daily confidence</h3>
                  <p className="text-xs text-muted font-body mt-0.5">How confident are you feeling today? (1–10)</p>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: `hsl(${(confidence - 1) * 14}, 55%, 50%)` }}
                  >
                    <span className="font-display font-bold text-lg" style={{ color: `hsl(${(confidence - 1) * 14}, 55%, 45%)` }}>
                      {confidence}
                    </span>
                  </div>
                  <input type="range" min={1} max={10} step={1} value={confidence}
                    onChange={e => setConfidence(parseInt(e.target.value))}
                    className="flex-1" />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm font-body text-accent bg-accent/8 border border-accent/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => { setError(null); setStep(s => s - 1) }}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-border text-muted font-body text-sm hover:text-ink-2 hover:border-ink-2 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button
              onClick={isLastStep ? handleSubmit : nextStep}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-accent text-white font-body font-medium text-sm hover:bg-accent-soft transition-colors disabled:opacity-60"
            >
              {btnLabel} {!loading && !isLastStep && <ChevronRight size={16} />}
            </button>
          </div>

          {step === 2 && (
            <button onClick={() => setStep(3)}
              className="w-full mt-3 text-sm text-muted font-body hover:text-ink-2 transition-colors py-2">
              Skip photos for now
            </button>
          )}
          {step === 5 && (
            <button onClick={() => { setPickedPrompts([]); setPromptAnswers({}); setStep(6) }}
              className="w-full mt-3 text-sm text-muted font-body hover:text-ink-2 transition-colors py-2">
              Skip prompts for now
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
