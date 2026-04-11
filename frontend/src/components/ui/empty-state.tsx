import { ReactNode } from 'react'

import { Card } from './card'

export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon ? (
        <div className="rounded-full border border-border bg-surface px-3 py-1.5 text-xl">
          {icon}
        </div>
      ) : null}
      <h3 className="text-section-title text-foreground">{title}</h3>
      <p className="max-w-lg text-small text-mutedForeground">{description}</p>
      {action}
    </Card>
  )
}
