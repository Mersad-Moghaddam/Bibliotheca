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
    <header className={cn('surface flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between md:p-6', className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="text-page-title text-foreground">{title}</h1>
        {description ? <p className="max-w-2xl text-small text-mutedForeground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
