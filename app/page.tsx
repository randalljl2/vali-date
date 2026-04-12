import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import { WaitlistForm } from './WaitlistForm'

export default async function LandingPage() {
  // Logged-in users go straight to the app
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/discover')

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body text-cream">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Logo size="md" />
        <div className="flex gap-2">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-cream transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-accent text-cream font-semibold px-4 py-2 rounded-full hover:bg-accent/90 transition-colors"
          >
            Join
          </Link>
        </div>
      </header>

      <main>

        {/* ── 1. Hero ───────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
          {/* Subtle radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(200,41,58,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Eyebrow */}
          <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rim text-muted text-xs mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Now in early access
          </div>

          {/* Logotype */}
          <h1 className="relative font-display font-black leading-none mb-6" style={{ fontSize: 'clamp(3.5rem, 14vw, 9rem)' }}>
            <span className="text-cream tracking-tight">VALI</span>
            <span className="text-accent italic tracking-tight ml-3">DATE</span>
          </h1>

          {/* Tagline */}
          <p className="relative font-display text-2xl sm:text-3xl text-cream/90 font-bold mb-4 max-w-xl leading-snug">
            Finally, an honest dating app.
          </p>
          <p className="relative text-muted text-base sm:text-lg max-w-md mb-12 leading-relaxed">
            Your attractiveness has a number. Tinder knows it. Hinge knows it.
            Now you can too — and so can everyone else.
          </p>

          {/* Waitlist form */}
          <div className="relative w-full max-w-md mx-auto">
            <WaitlistForm />
            <p className="mt-4 text-xs text-muted">
              Already a member?{' '}
              <Link href="/login" className="text-cream underline underline-offset-2 hover:text-accent">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        {/* ── 2. The Confession ─────────────────────────────── */}
        <section className="px-6 py-24 max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center space-y-6"
            style={{ background: 'linear-gradient(135deg, #1a0a0c 0%, #2a0e12 100%)', border: '1px solid rgba(200,41,58,0.25)' }}
          >
            <p className="text-accent/70 text-xs font-semibold uppercase tracking-widest">The truth no one tells you</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-cream leading-snug">
              The apps you&apos;re on right now<br />
              <span className="text-accent italic">already rate you.</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 text-left">
              {[
                { app: 'Tinder',   metric: 'ELO score',          note: 'Determines who even sees your profile.' },
                { app: 'Hinge',    metric: 'Desirability score',  note: 'Controls how many "Standouts" you appear in.' },
                { app: 'Bumble',   metric: 'Internal ranking',    note: 'Shapes how often you surface in search.' },
              ].map(({ app, metric, note }) => (
                <div key={app} className="bg-black/30 rounded-2xl p-4 space-y-1.5 border border-white/5">
                  <p className="text-muted text-xs uppercase tracking-widest">{app}</p>
                  <p className="text-cream font-semibold font-display text-base">{metric}</p>
                  <p className="text-muted text-xs leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
            <p className="text-cream/70 text-sm leading-relaxed max-w-xl mx-auto">
              They hide these numbers from you while using them to decide your dating life.
              Vali Date puts the score in your hands — and everyone else&apos;s.
            </p>
          </div>
        </section>

        {/* ── 3. How It Works ───────────────────────────────── */}
        <section className="px-6 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent/70 text-xs font-semibold uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-cream">How it works</h2>
          </div>
          <div className="grid sm:grid-cols-4 gap-5">
            {[
              { step: '01', title: 'Rate',      desc: 'Score every profile 1–10. No likes, no hearts — just a number.' },
              { step: '02', title: 'Get Rated', desc: 'Others rate you. Your rolling average becomes your public score.' },
              { step: '03', title: 'Match',     desc: 'Mutual 5+ ratings unlock a full match between you and them.' },
              { step: '04', title: 'Connect',   desc: 'Chat, plan dates, and meet people who are genuinely into you.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative bg-surface border border-rim rounded-2xl p-6 space-y-3">
                <span className="font-display font-black text-4xl text-accent/20 leading-none">{step}</span>
                <h3 className="font-display font-bold text-cream text-lg">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Features ───────────────────────────────────── */}
        <section className="px-6 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent/70 text-xs font-semibold uppercase tracking-widest mb-3">Built different</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-cream">Every feature earns its place</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '🏆',
                title: 'Score Tiers',
                desc: 'Newcomer → Rising → Validated → Certified → Iconic. Your tier updates as your score evolves.',
              },
              {
                icon: '📊',
                title: 'Live Leaderboard',
                desc: 'See where you rank against your city. Compete. Climb. Stay humble.',
              },
              {
                icon: '🔔',
                title: 'Near Match Alerts',
                desc: 'Someone gave you a 4. They\'re on the fence. You get an alert — so you can change their mind.',
              },
              {
                icon: '✉️',
                title: 'Convince Me',
                desc: 'Send one message to a near match. Make your case. If they upgrade to 5+, you match.',
              },
              {
                icon: '⚡',
                title: 'Hot Streak Boost',
                desc: 'Premium users get a weekly 60-minute visibility surge. Show up first, everywhere.',
              },
              {
                icon: '📈',
                title: 'Daily Confidence',
                desc: 'Log your confidence each day. Watch your self-perception and score correlate over time.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-surface border border-rim rounded-2xl p-6 space-y-3 hover:border-accent/20 transition-colors">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-display font-bold text-cream">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Social Proof ───────────────────────────────── */}
        <section className="px-6 py-24 max-w-3xl mx-auto text-center space-y-16">
          {/* Big stat */}
          <div className="space-y-2">
            <p
              className="font-display font-black leading-none text-cream"
              style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)' }}
            >
              2.4M
            </p>
            <p className="text-muted text-lg">ratings given today alone.</p>
          </div>

          {/* Testimonial */}
          <div className="bg-surface border border-rim rounded-3xl p-8 text-left space-y-5 max-w-lg mx-auto">
            <p className="text-cream text-lg leading-relaxed font-display font-medium">
              &ldquo;I&apos;ve been on Tinder for three years and never once knew what my ELO was.
              Vali Date told me in 48 hours. My score is an 8.4 and I finally understand
              why my matches improved when I updated my photos.&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-rim">
              <div className="w-10 h-10 rounded-full bg-[#e8c46a]/20 border border-[#e8c46a]/40 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-[#e8c46a] text-sm">J</span>
              </div>
              <div>
                <p className="text-cream font-semibold text-sm">@jordanxla</p>
                <p className="text-muted text-xs">Certified · 8.4 score</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Final CTA ──────────────────────────────────── */}
        <section className="px-6 py-24 max-w-xl mx-auto text-center space-y-8">
          <h2 className="font-display font-black text-cream" style={{ fontSize: 'clamp(2.2rem, 8vw, 4rem)', lineHeight: 1.1 }}>
            Know your number.<br />
            <span className="text-accent italic">Own it.</span>
          </h2>
          <p className="text-muted leading-relaxed">
            No fake swipes. No hidden algorithms. No manufactured matches.
            Just honest ratings and real people.
          </p>
          <WaitlistForm placeholder="Your email address" buttonLabel="Get early access" />
          <p className="text-muted/50 text-xs">No fake promises. Unsubscribe any time.</p>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-rim py-10 px-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Logo size="sm" />
          <p className="text-xs text-muted">© 2026 Vali Date. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted">
            <Link href="/terms"   className="hover:text-cream transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-cream transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-cream transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
