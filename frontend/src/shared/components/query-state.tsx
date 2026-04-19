import { AlertTriangle, Inbox } from 'lucide-react'
import { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'
import { Skeleton } from '../../components/ui/skeleton'
import { useI18n } from '../i18n/i18n-provider'

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
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite" aria-label={t('common.loading')}>
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title={t('query.errorTitle')}
        description={t('query.errorDescription')}
        action={
          onRetry ? (
            <Button size="sm" onClick={onRetry} aria-label={t('query.retry')}>
              {t('query.retry')}
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (isEmpty) {
    return <EmptyState icon={<Inbox className="h-5 w-5" />} title={emptyTitle} description={emptyDescription} />
  }

  return <>{children}</>
}
