import { TextareaHTMLAttributes, forwardRef } from 'react'

import { cn } from '../../lib/cn'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-24 w-full rounded-xl border border-input/85 bg-card px-3.5 py-3 text-sm text-foreground shadow-sm transition-all duration-200 ease-premium placeholder:text-mutedForeground focus-visible:-translate-y-px focus-visible:border-ring focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15',
        className
      )}
      {...props}
    />
  )
})
