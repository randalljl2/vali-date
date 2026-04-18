'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Heart, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/discover',  label: 'Discover',   icon: Compass },
  { href: '/matches',   label: 'Matches',    icon: Heart },
  { href: '/questions', label: 'Questions',  icon: BookOpen },
  { href: '/profile',   label: 'Profile',    icon: User },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-body font-medium transition-colors relative',
                active ? 'text-accent' : 'text-muted hover:text-ink-2'
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.75}
                className={cn('transition-transform', active && 'scale-110')}
              />
              <span className="tracking-wide uppercase">{label}</span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
