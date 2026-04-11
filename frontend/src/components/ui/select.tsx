import { SelectHTMLAttributes, forwardRef } from 'react'

import { cn } from '../../lib/cn'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-sm transition-all duration-200 ease-premium focus-visible:border-ring focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
          className
        )}
        {...props}
      />
    )
  }
)
