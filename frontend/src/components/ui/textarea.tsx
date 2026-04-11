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
        'min-h-24 w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground shadow-sm transition-all duration-200 ease-premium placeholder:text-mutedForeground focus-visible:border-ring focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
        className
      )}
      {...props}
    />
  )
})
