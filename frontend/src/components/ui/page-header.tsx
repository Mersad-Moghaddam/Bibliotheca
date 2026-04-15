import { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
  className
}: {
  title: string
  description?: string
  action?: ReactNode
  eyebrow?: string
  className?: string
}) {
  return (
    <header
      className={cn(
        'surface flex flex-col gap-3 p-4 sm:gap-4 sm:p-6 md:flex-row md:items-end md:justify-between md:p-7',
        className
      )}
    >
      <div className="space-y-1.5 sm:space-y-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-page-title">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-mutedForeground sm:text-small">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
