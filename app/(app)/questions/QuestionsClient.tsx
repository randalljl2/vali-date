'use client'

import { useState } from 'react'
import { saveAnswers } from '@/lib/actions'
import { getSetQuestions, SET_LABELS } from '@/lib/questions'
import type { UserAnswer } from '@/types'
import { Check, BookOpen } from 'lucide-react'

interface Props {
  initialAnswers: UserAnswer[]
}

type AnswerMap = Record<string, { answer: string; importance: number }>

const IMPORTANCE_LABELS: Record<number, string> = {
  1: 'Nice to know',
  2: 'Matters to me',
  3: 'Deal-breaker',
}

const SETS = [2, 3, 4]

function answerKey(set: number, num: number) {
  return `${set}-${num}`
}

export function QuestionsClient({ initialAnswers }: Props) {
  const [activeSet, setActiveSet] = useState(2)
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    const m: AnswerMap = {}
    for (const a of initialAnswers) {
      m[answerKey(a.question_set, a.question_number)] = { answer: a.answer, importance: a.importance }
    }
    return m
  })
  const [saving, setSaving] = useState(false)
  const [savedSet, setSavedSet] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const questions = getSetQuestions(activeSet)

  function setAnswer(set: number, num: number, answer: string) {
    const key = answerKey(set, num)
    setAnswers(prev => ({
      ...prev,
      [key]: { answer, importance: prev[key]?.importance ?? 2 },
    }))
    setSavedSet(null)
  }

  function setImportance(set: number, num: number, importance: number) {
    const key = answerKey(set, num)
    setAnswers(prev => ({
      ...prev,
      [key]: { answer: prev[key]?.answer ?? '', importance },
    }))
    setSavedSet(null)
  }

  function countAnswered(set: number) {
    return getSetQuestions(set).filter(q => {
      const a = answers[answerKey(q.set, q.number)]
      return a?.answer && a?.importance
    }).length
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const toSave = questions
      .filter(q => {
        const a = answers[answerKey(q.set, q.number)]
        return a?.answer && a?.importance
      })
      .map(q => {
        const a = answers[answerKey(q.set, q.number)]
        return {
          question_set: q.set,
          question_number: q.number,
          answer: a.answer,
          importance: a.importance,
        }
      })

    if (toSave.length === 0) {
      setError('Answer at least one question before saving.')
      setSaving(false)
      return
    }

    const result = await saveAnswers(toSave)
    setSaving(false)

    if ('error' in result) {
      setError(result.error)
      return
    }

    setSavedSet(activeSet)
    setTimeout(() => setSavedSet(null), 3000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg pb-8">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={18} className="text-accent" />
          <h1 className="font-display font-bold text-2xl text-ink">Questions</h1>
        </div>
        <p className="text-muted font-body text-sm">
          The more you answer, the better your compatibility scores. Set 1 was completed during onboarding.
        </p>
      </div>

      {/* Set tabs */}
      <div className="px-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SETS.map(set => {
          const answered = countAnswered(set)
          const total = 25
          const isActive = activeSet === set
          return (
            <button
              key={set}
              onClick={() => { setActiveSet(set); setError(null) }}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border font-body text-sm font-medium transition-all ${
                isActive
                  ? 'border-accent bg-accent/8 text-ink'
                  : 'border-border bg-surface text-muted hover:border-accent/30 hover:text-ink'
              }`}
            >
              <span className="block text-left">{SET_LABELS[set]}</span>
              <span className={`block text-xs mt-0.5 font-normal ${isActive ? 'text-muted' : 'text-muted/60'}`}>
                {answered}/{total} answered
              </span>
            </button>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-body text-muted">{SET_LABELS[activeSet]}</span>
          <span className="text-xs font-body text-muted">{countAnswered(activeSet)}/25</span>
        </div>
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(countAnswered(activeSet) / 25) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="px-4 mt-5 space-y-4">
        {questions.map((q) => {
          const key = answerKey(q.set, q.number)
          const current = answers[key]
          const answered = !!(current?.answer && current?.importance)

          return (
            <div
              key={key}
              className={`bg-surface border rounded-2xl p-4 space-y-4 transition-colors ${
                answered ? 'border-accent/20' : 'border-border'
              }`}
            >
              {/* Question */}
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted font-body mt-0.5 flex-shrink-0 tabular-nums w-5">
                  {q.number}.
                </span>
                <p className="font-body font-medium text-ink text-sm leading-snug">{q.text}</p>
                {answered && (
                  <div className="ml-auto flex-shrink-0">
                    <Check size={14} className="text-accent" />
                  </div>
                )}
              </div>

              {/* Answer options */}
              <div className="space-y-2">
                {(['a', 'b', 'c'] as const).map(opt => {
                  const label = q[opt]
                  const isSelected = current?.answer === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswer(q.set, q.number, opt)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border font-body text-sm transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/8 text-ink font-medium'
                          : 'border-border bg-bg text-ink-2 hover:border-accent/30'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Importance — only show if an answer is selected */}
              {current?.answer && (
                <div className="space-y-2">
                  <p className="text-xs text-muted font-body">How much does this matter to you?</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map(imp => {
                      const isSelected = current?.importance === imp
                      return (
                        <button
                          key={imp}
                          onClick={() => setImportance(q.set, q.number, imp)}
                          className={`py-2 px-1 rounded-xl border font-body text-[11px] text-center leading-tight transition-all ${
                            isSelected
                              ? imp === 3
                                ? 'border-accent bg-accent/10 text-accent font-semibold'
                                : 'border-accent/50 bg-accent/6 text-ink font-medium'
                              : 'border-border bg-bg text-muted hover:border-accent/30'
                          }`}
                        >
                          {IMPORTANCE_LABELS[imp]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="px-4 mt-6 space-y-3">
        {error && (
          <p className="text-xs text-accent font-body text-center">{error}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || savedSet === activeSet}
          className={`w-full py-3.5 rounded-2xl text-sm font-body font-semibold transition-colors ${
            savedSet === activeSet
              ? 'bg-[#2a7d5f]/15 border border-[#2a7d5f]/30 text-[#2a7d5f]'
              : 'bg-accent text-white hover:bg-accent-soft disabled:opacity-60'
          }`}
        >
          {saving
            ? 'Saving…'
            : savedSet === activeSet
            ? `✓ ${SET_LABELS[activeSet]} saved`
            : `Save ${SET_LABELS[activeSet]}`}
        </button>
        <p className="text-center text-xs text-muted font-body">
          Only answered questions are saved. You can always come back to finish.
        </p>
      </div>
    </div>
  )
}
