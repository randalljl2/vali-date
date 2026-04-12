'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Trophy, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/discover',    label: 'Discover',    icon: Compass },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/matches',     label: 'Matches',     icon: Heart },
  { href: '/profile',     label: 'Profile',     icon: User },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-rim">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-body font-medium transition-colors',
                active ? 'text-accent' : 'text-muted hover:text-cream'
              )}
            >
              <Icon
                size={20}
                className={cn('transition-transform', active && 'scale-110')}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-accent rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
