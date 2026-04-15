import { InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '../../lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3.5 text-sm text-foreground transition-all duration-150 ease-premium placeholder:text-mutedForeground focus-visible:border-primary/40 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20',
          className
        )}
        {...props}
      />
    )
  }
)
