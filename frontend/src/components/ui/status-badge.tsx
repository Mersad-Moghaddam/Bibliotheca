import { Badge } from './badge'
import { BookStatus } from '../../types'

export const statusLabel: Record<BookStatus, string> = {
  inLibrary: 'In Library',
  currentlyReading: 'Currently Reading',
  finished: 'Finished',
  nextToRead: 'Next To Read'
}

const statusStyles: Record<BookStatus, string> = {
  inLibrary: 'bg-muted text-mutedForeground',
  currentlyReading: 'bg-accent/25 text-accentForeground',
  finished: 'bg-success/20 text-success',
  nextToRead: 'bg-warning/20 text-warning'
}

export function StatusBadge({ status }: { status: BookStatus }) {
  return <Badge className={statusStyles[status]}>{statusLabel[status]}</Badge>
}
