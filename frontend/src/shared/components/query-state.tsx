import { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'
import { Skeleton } from '../../components/ui/skeleton'

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  children,
  onRetry,
  emptyTitle,
  emptyDescription
}: {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  children: ReactNode
  onRetry?: () => void
  emptyTitle: string
  emptyDescription: string
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Something went wrong"
        description="We could not load this section."
        action={
          onRetry ? (
            <Button size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (isEmpty) {
    return <EmptyState icon="📭" title={emptyTitle} description={emptyDescription} />
  }

  return <>{children}</>
}
