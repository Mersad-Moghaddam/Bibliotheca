import { Badge } from './badge'
import { BookStatus } from '../../types'
import { useI18n } from '../../shared/i18n/i18n-provider'

const statusStyles: Record<BookStatus, string> = {
  inLibrary: 'border border-border bg-secondary text-secondaryForeground',
  currentlyReading: 'border border-accent/60 bg-accent/35 text-accentForeground',
  finished: 'border border-success/30 bg-success/15 text-success',
  nextToRead: 'border border-warning/30 bg-warning/12 text-warning'
}

export function StatusBadge({ status }: { status: BookStatus }) {
  const { t } = useI18n()
  return <Badge className={statusStyles[status]}>{t(`status.${status}`)}</Badge>
}
