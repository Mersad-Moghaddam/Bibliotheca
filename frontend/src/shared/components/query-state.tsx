import { AlertTriangle, Inbox } from 'lucide-react'
import { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'
import {
  BookDetailsSkeleton,
  BookGridSkeleton,
  BookListSkeleton,
  DashboardSkeleton,
  ProfileSkeleton,
  WishlistSkeleton
} from '../../components/ui/loading-skeletons'
import { Skeleton } from '../../components/ui/skeleton'
import { useI18n } from '../i18n/i18n-provider'

function LoadingByVariant({ variant }: { variant: QueryStateVariant }) {
  if (variant === 'dashboard') return <DashboardSkeleton />
  if (variant === 'book-grid') return <BookGridSkeleton />
  if (variant === 'book-list') return <BookListSkeleton />
  if (variant === 'wishlist') return <WishlistSkeleton />
  if (variant === 'book-details') return <BookDetailsSkeleton />
  if (variant === 'profile') return <ProfileSkeleton />

  return (
    <div className="space-y-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  )
}

type QueryStateVariant = 'default' | 'dashboard' | 'book-grid' | 'book-list' | 'wishlist' | 'book-details' | 'profile'

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  children,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  loadingVariant = 'default'
}: {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  children: ReactNode
  onRetry?: () => void
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
  loadingVariant?: QueryStateVariant
}) {
  const { t } = useI18n()

  if (isLoading) {
    return <LoadingByVariant variant={loadingVariant} />
  }

  if (isError) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title={t('query.errorTitle')}
        description={t('query.errorDescription')}
        action={
          onRetry ? (
            <Button size="sm" onClick={onRetry}>
              {t('query.retry')}
            </Button>
          ) : undefined
        }
      />
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={<Inbox className="h-5 w-5" />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        tone="soft"
      />
    )
  }

  return <>{children}</>
}
