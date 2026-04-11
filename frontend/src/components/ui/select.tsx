import { SelectHTMLAttributes, forwardRef } from 'react'

import { cn } from '../../lib/cn'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-input/85 bg-card px-3.5 text-sm text-foreground shadow-sm transition-all duration-200 ease-premium focus-visible:-translate-y-px focus-visible:border-ring focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15',
          className
        )}
        {...props}
      />
    )
  }
)
