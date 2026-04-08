import { Badge } from './badge'
import { BookStatus } from '../../types'

export const statusLabel: Record<BookStatus, string> = {
  inLibrary: 'In Library',
  currentlyReading: 'Currently Reading',
  finished: 'Finished',
  nextToRead: 'Next To Read'
}

const statusStyles: Record<BookStatus, string> = {
  inLibrary: 'border border-border bg-secondary text-secondaryForeground',
  currentlyReading: 'border border-accent/60 bg-accent/35 text-accentForeground',
  finished: 'border border-success/30 bg-success/15 text-success',
  nextToRead: 'border border-warning/30 bg-warning/12 text-warning'
}

export function StatusBadge({ status }: { status: BookStatus }) {
  return <Badge className={statusStyles[status]}>{statusLabel[status]}</Badge>
}
