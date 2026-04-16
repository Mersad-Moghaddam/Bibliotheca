import { ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

import { cn } from '../../lib/cn'

import { Button } from './button'
import { Card } from './card'

export function ContextActionCard({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className
}: {
  title: string
  description: string
  icon?: ReactNode
  actionLabel: string
  onAction: () => void | Promise<void>
  className?: string
}) {
  return (
    <Card className={cn('surface-hover space-y-3 p-4 sm:p-5', className)}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon ? <span className="text-mutedForeground">{icon}</span> : null}
          <p>{title}</p>
        </div>
        <p className="text-sm text-mutedForeground">{description}</p>
      </div>
      <Button size="sm" variant="secondary" className="w-full justify-between" onClick={() => void onAction()}>
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  )
}
