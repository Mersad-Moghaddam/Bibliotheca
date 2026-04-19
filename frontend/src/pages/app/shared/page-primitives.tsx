import { LibraryBig, Sparkles } from 'lucide-react'

import { Card } from '../../../components/ui/card'
import { useI18n } from '../../../shared/i18n/i18n-provider'

export const statusOptions = ['inLibrary', 'currentlyReading', 'finished', 'nextToRead'] as const

export function PageHeading({ title }: { title: string }) {
  return <h1 className="sr-only">{title}</h1>
}

export function FieldError({ message }: { message?: string }) {
  const { t } = useI18n()
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-destructive" role="alert" aria-live="polite">
      {message.startsWith('validation.') ? t(message) : message}
    </p>
  )
}

export function FieldBlock({
  label,
  children,
  hint
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-label text-mutedForeground">{label}</span>
      {children}
      {hint ? <p className="text-xs text-mutedForeground">{hint}</p> : null}
    </label>
  )
}

export function BookCover({ title, coverUrl }: { title: string; coverUrl?: string | null }) {
  if (coverUrl) {
    return <img src={coverUrl} alt={title} className="h-24 w-16 rounded-lg border border-border/80 object-cover" />
  }
  return (
    <div className="flex h-24 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-mutedForeground">
      <LibraryBig className="h-4 w-4" />
    </div>
  )
}

export function StatCard({
  title,
  value,
  icon: Icon
}: {
  title: string
  value: string | number
  icon: typeof Sparkles
}) {
  return (
    <Card className="surface-hover p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-small text-mutedForeground">{title}</p>
        <span className="rounded-lg bg-surface p-2 text-mutedForeground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold sm:text-3xl">{value}</p>
    </Card>
  )
}
