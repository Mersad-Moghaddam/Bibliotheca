import { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export function DataToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-3 p-1 sm:grid-cols-2 xl:grid-cols-5', className)}>{children}</div>
}
