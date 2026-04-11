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
    'border border-primary/90 bg-primary text-primaryForeground shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md',
  secondary:
    'border border-border bg-card text-foreground/90 shadow-sm hover:-translate-y-0.5 hover:border-border/80 hover:bg-secondary',
  ghost: 'border border-transparent text-foreground/85 hover:bg-secondary/85 hover:text-foreground',
  destructive:
    'border border-destructive/35 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:-translate-y-0.5'
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-lg px-3 text-sm',
  md: 'h-11 rounded-xl px-4 text-sm',
  lg: 'h-12 rounded-xl px-5 text-body'
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
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[-0.01em] transition-all duration-200 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
