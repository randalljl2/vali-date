import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import { WaitlistForm } from './WaitlistForm'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/discover')

  return (
    <div className="min-h-screen bg-bg text-ink font-body">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-border-soft">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-muted hover:text-ink-2 transition-colors px-4 py-2 font-body"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-accent text-white font-body font-medium px-4 py-2 rounded-full hover:bg-accent-soft transition-colors"
            >
              Join free
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ── 1. Hero ───────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-24">
          <p className="font-body text-xs uppercase tracking-[0.25em] text-muted mb-8">
            A return to dating app honesty
          </p>

          <h1
            className="font-display font-black text-ink leading-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 10vw, 7rem)' }}
          >
            A return to<br />
            <span className="italic text-accent">honest dating.</span>
          </h1>

          <p className="font-serif italic text-ink-2 text-lg sm:text-xl max-w-lg mb-4 leading-relaxed">
            Built on self-knowledge. Not swipes.
          </p>

          <div className="mt-10 w-full max-w-md">
            <WaitlistForm />
            <p className="mt-4 text-xs text-muted font-body">
              Already a member?{' '}
              <Link href="/login" className="text-ink-2 underline underline-offset-2 hover:text-accent">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        {/* ── 2. Emotional hook ─────────────────────────────── */}
        <section className="px-6 py-16 max-w-2xl mx-auto text-center">
          <p className="font-serif italic text-ink-2 text-lg sm:text-xl leading-relaxed">
            Endless swiping. Conversations that go nowhere. Matches who want something
            completely different from you. Dating apps were supposed to make this easier.
            Somehow they made it worse.
          </p>
        </section>

        {/* ── 3. The Confession ─────────────────────────────── */}
        <section className="px-6 py-20 max-w-3xl mx-auto">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center space-y-6"
            style={{
              background: 'linear-gradient(135deg, #2a1f18 0%, #332519 100%)',
              border: '1px solid rgba(122,37,53,0.3)',
            }}
          >
            <p className="text-xs uppercase tracking-widest font-body" style={{ color: '#9e3345' }}>
              The truth no one tells you
            </p>

            <h2
              className="font-display font-bold leading-snug"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', color: '#f5f0e8' }}
            >
              The apps you&apos;re on right now
              <br />
              <span style={{ color: '#9e3345', fontStyle: 'italic' }}>already rate you.</span>
            </h2>

            <div className="grid sm:grid-cols-3 gap-4 text-left">
              {[
                { app: 'Tinder',   metric: 'ELO score',         note: 'Determines who even sees your profile.' },
                { app: 'Hinge',    metric: 'Desirability score', note: 'Controls how many "Standouts" you appear in.' },
                { app: 'Bumble',   metric: 'Internal ranking',   note: 'Shapes how often you surface in search.' },
              ].map(({ app, metric, note }) => (
                <div
                  key={app}
                  className="rounded-2xl p-4 space-y-1.5"
                  style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-xs uppercase tracking-widest font-body" style={{ color: '#8a7b6a' }}>{app}</p>
                  <p className="font-display font-bold text-base" style={{ color: '#f5f0e8' }}>{metric}</p>
                  <p className="text-xs leading-relaxed font-body" style={{ color: '#8a7b6a' }}>{note}</p>
                </div>
              ))}
            </div>

            <p
              className="text-sm leading-relaxed max-w-xl mx-auto font-body"
              style={{ color: 'rgba(245,240,232,0.65)' }}
            >
              No hidden desirability scores. Just transparent compatibility built on who you actually are.
            </p>
          </div>
        </section>

        {/* ── 3. A Different Kind ───────────────────────────── */}
        <section className="px-6 py-20 max-w-3xl mx-auto">
          <div className="text-center space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-muted font-body">
              Standing on the shoulders of giants
            </p>
            <h2
              className="font-display font-bold text-ink leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}
            >
              Built on what actually worked.
            </h2>
            <p className="font-serif italic text-ink-2 text-lg leading-relaxed max-w-2xl mx-auto">
              The original OkCupid matched millions of people through deep questionnaires and honest
              compatibility scores. eHarmony built lasting relationships on 29 dimensions of
              self-knowledge. Then the swipe era arrived — and everything that worked got stripped
              away in favor of algorithms and dopamine loops. ValiDate is built on the same
              principles that made those early apps genuinely good — the belief that honest
              self-knowledge, not surface-level judgment, is the foundation of real connection.
            </p>
          </div>
        </section>

        {/* ── 4. How It Works ───────────────────────────────── */}
        <section className="px-6 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-muted font-body mb-3">Simple by design</p>
            <h2 className="font-display font-bold text-ink mb-5" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>
              How it works
            </h2>
            <p className="font-serif italic text-muted text-base leading-relaxed max-w-xl mx-auto">
              We compare your answers across values, lifestyle, communication style, and long-term
              goals to calculate a real compatibility score.
            </p>
          </div>

          <div className="grid sm:grid-cols-4 gap-5">
            {[
              { n: '01', title: 'Answer honestly',  desc: 'Work through 25 thoughtful questions. Your answers stay private — they only power the algorithm.' },
              { n: '02', title: 'Get matched',       desc: 'See your compatibility percentage with everyone in the feed. Matches require mutual interest and 60%+ compatibility. Below 60%, long-term alignment drops significantly. We\'d rather show you fewer, better matches.' },
              { n: '03', title: 'Connect',           desc: 'Express interest. When it\'s mutual and you\'re compatible, a match is created.' },
              { n: '04', title: 'Go deeper',         desc: 'Answer more question sets to improve your compatibility score and surface better matches.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="bg-surface border border-border rounded-2xl p-6 space-y-3 shadow-sm">
                <span className="font-display font-black text-4xl text-accent leading-none">{n}</span>
                <h3 className="font-display font-bold text-ink text-lg">{title}</h3>
                <p className="text-muted text-sm leading-relaxed font-body">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Features ───────────────────────────────────── */}
        <section className="px-6 py-20 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-muted font-body mb-3">Built different</p>
            <h2 className="font-display font-bold text-ink" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>
              Every feature earns its place
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🎯', title: 'Compatibility percentage',  desc: 'See exactly how compatible you are before expressing interest. Big number, front and centre.' },
              { icon: '📋', title: 'Question sets',             desc: 'Four sets of 25 questions. The more you answer, the more accurate your compatibility scores become.' },
              { icon: '🪪', title: 'Honest profiles',           desc: 'No games, no ELO theatrics. Prompts, height, why you\'re here — honest from the start.' },
              { icon: '💬', title: 'Real matching',             desc: 'Matches require mutual interest and 60%+ compatibility. Quality over volume.' },
              { icon: '📊', title: 'Compatibility breakdown',   desc: 'Paid users see which question categories drive — and tank — their scores.' },
              { icon: '📈', title: 'Daily confidence',          desc: 'Log how confident you\'re feeling. It shows on your card, not a number — just a human detail.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-surface border border-border rounded-2xl p-6 space-y-3 shadow-sm hover:border-border-soft transition-colors">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-display font-bold text-ink">{title}</h3>
                <p className="text-muted text-sm leading-relaxed font-body">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Social proof ───────────────────────────────── */}
        <section className="px-6 py-24 max-w-3xl mx-auto text-center">
          <p className="font-serif italic text-muted text-xl leading-relaxed">
            Built for people who are tired of swiping into the void.
          </p>
        </section>

        {/* ── 7. Final CTA ──────────────────────────────────── */}
        <section className="px-6 py-24 max-w-xl mx-auto text-center space-y-8">
          <h2
            className="font-display font-black text-ink leading-tight"
            style={{ fontSize: 'clamp(2rem, 8vw, 4rem)' }}
          >
            Honest answers.<br />
            <span className="italic text-accent">Real matches.</span>
          </h2>
          <p className="text-muted font-body leading-relaxed">
            No hidden scores. No manufactured matches.
            Just who you are and who you&apos;re compatible with.
          </p>
          <WaitlistForm buttonLabel="Get early access" />
          <p className="text-muted/50 text-xs font-body">No fake promises. Unsubscribe any time.</p>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <Logo size="sm" />
          <p className="text-xs text-muted font-body">© 2026 ValiDate. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted font-body">
            <Link href="/terms"   className="hover:text-ink-2 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-ink-2 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-ink-2 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
