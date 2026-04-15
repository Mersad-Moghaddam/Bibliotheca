import { ReactNode } from 'react'

export function SectionHeader({
  title,
  description,
  icon,
  action
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-lg font-semibold leading-tight text-foreground sm:text-section-title">
          {icon ? <span className="text-mutedForeground">{icon}</span> : null}
          {title}
        </h2>
        {description ? <p className="text-sm text-mutedForeground sm:text-small">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
