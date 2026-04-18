import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <span
      className={cn(
        'font-display inline-flex items-baseline select-none',
        sizes[size],
        className
      )}
    >
      <span className="text-ink font-extrabold tracking-tight">Vali</span>
      <span className="text-accent font-extrabold italic tracking-tight">Date</span>
    </span>
  )
}
