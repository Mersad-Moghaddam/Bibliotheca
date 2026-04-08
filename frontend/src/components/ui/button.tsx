import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary: 'border border-primary/80 bg-primary text-primaryForeground hover:brightness-110 shadow-sm hover:shadow-md',
  secondary: 'border border-border bg-card text-foreground hover:bg-secondary',
  ghost: 'border border-transparent text-foreground hover:bg-secondary',
  destructive: 'border border-destructive/35 bg-destructive/10 text-destructive hover:bg-destructive/20'
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-body'
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
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium tracking-[-0.01em] transition-all duration-200 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
