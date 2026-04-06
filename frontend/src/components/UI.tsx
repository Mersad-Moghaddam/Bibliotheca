import { ReactNode } from 'react'
import { BookStatus } from '../types'

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className='card'>
    <h2 className='section-title'>{title}</h2>
    {children}
  </section>
)

export const statusLabel: Record<BookStatus, string> = {
  inLibrary: 'In Library',
  currentlyReading: 'Currently Reading',
  finished: 'Finished',
  nextToRead: 'Next To Read'
}

export const StatusBadge = ({ status }: { status: BookStatus }) => {
  const styles: Record<BookStatus, string> = {
    inLibrary: 'status-in-library',
    currentlyReading: 'status-currently-reading',
    finished: 'status-finished',
    nextToRead: 'status-next-to-read'
  }

  return <span className={`badge ${styles[status]}`}>{statusLabel[status]}</span>
}

export const Progress = ({ value }: { value: number }) => (
  <div className='progress-track'>
    <div className='progress-fill' style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
)
