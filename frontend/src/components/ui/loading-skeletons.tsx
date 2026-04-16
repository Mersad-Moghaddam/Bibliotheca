import { Skeleton } from './skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-36 rounded-2xl" />
      <div className="grid gap-3 xl:grid-cols-2">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  )
}

export function BookGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-2xl" />
      ))}
    </div>
  )
}

export function BookListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-2xl" />
      ))}
    </div>
  )
}

export function WishlistSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-2xl" />
      ))}
    </div>
  )
}

export function BookDetailsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24 rounded-2xl" />
      <div className="grid gap-3 xl:grid-cols-2">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  )
}
