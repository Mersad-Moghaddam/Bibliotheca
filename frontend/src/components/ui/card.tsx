import { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-card p-6 shadow-sm', className)} {...props} />
}

export function SectionCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Card className={cn('space-y-4', className)} {...props} />
}
