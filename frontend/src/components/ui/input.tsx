import { InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '../../lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-sm transition-all duration-200 ease-premium placeholder:text-mutedForeground focus-visible:border-ring focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
          className
        )}
        {...props}
      />
    )
  }
)
