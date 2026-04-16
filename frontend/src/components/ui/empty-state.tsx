import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

import { cn } from '../../lib/cn'

import { Card } from './card'

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'default',
  className,
  hint
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  tone?: 'default' | 'soft'
  className?: string
  hint?: string
}) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-center',
        tone === 'soft' && 'border-dashed bg-surface/65',
        className
      )}
    >
      {icon ? (
        <div className="rounded-full border border-border bg-surface px-3 py-1.5 text-xl text-mutedForeground">
          {icon}
        </div>
      ) : null}
      <h3 className="text-section-title text-foreground">{title}</h3>
      <p className="max-w-lg text-small text-mutedForeground">{description}</p>
      {hint ? (
        <p className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-mutedForeground">
          <ArrowRight className="h-3 w-3" /> {hint}
        </p>
      ) : null}
      {action}
    </Card>
  )
}
