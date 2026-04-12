'use client'

import { X, Zap } from 'lucide-react'
import Link from 'next/link'

interface Props {
  onClose: () => void
  reason?: string
}

export function UpgradeModal({ onClose, reason }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-6 sm:pb-0"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-sm bg-surface border border-rim rounded-3xl p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-cream transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 rounded-full bg-[#e8c46a]/15 border border-[#e8c46a]/30 flex items-center justify-center mx-auto">
            <Zap size={22} className="text-[#e8c46a]" />
          </div>
          <h2 className="font-display font-bold text-xl text-cream">
            {reason ?? 'Upgrade to see who likes you'}
          </h2>
          <p className="text-muted font-body text-sm leading-relaxed">
            Someone&apos;s on the fence about you. Upgrade to Vali Date Plus to see who it is and send them a message.
          </p>
        </div>

        <div className="space-y-2">
          <Link
            href="/subscribe"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#e8c46a] text-bg font-body font-semibold text-sm hover:bg-[#e8c46a]/90 transition-colors"
          >
            <Zap size={15} />
            See plans — from $9.99/mo
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-muted font-body text-xs hover:text-cream transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
