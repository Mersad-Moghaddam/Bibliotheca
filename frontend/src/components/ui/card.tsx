import { HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface p-6', className)} {...props} />
}

export function SectionCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Card className={cn('space-y-5 p-5 md:p-6', className)} {...props} />
}
