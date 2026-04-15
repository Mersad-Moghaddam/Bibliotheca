import { ButtonHTMLAttributes, forwardRef } from 'react'

import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border border-primary bg-primary text-primaryForeground shadow-sm hover:bg-primary/92 hover:shadow-md',
  secondary:
    'border border-border bg-card text-foreground hover:border-primary/30 hover:bg-surface',
  ghost: 'border border-transparent bg-transparent text-mutedForeground hover:bg-surface hover:text-foreground',
  destructive: 'border border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15'
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 rounded-lg px-3 text-xs sm:h-9',
  md: 'h-11 rounded-xl px-4 text-sm',
  lg: 'h-12 rounded-xl px-5 text-sm'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
