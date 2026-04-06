import { ReactNode } from 'react'

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className='card'>
    <h2 className='mb-3 text-2xl text-primary'>{title}</h2>
    {children}
  </section>
)

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    currently_reading: 'status-currently-reading',
    finished: 'status-finished',
    next_to_read: 'status-next-to-read'
  }

  return <span className={`badge ${styles[status] ?? 'status-currently-reading'}`}>{status.replaceAll('_', ' ')}</span>
}

export const Progress = ({ value }: { value: number }) => (
  <div className='progress-track'>
    <div className='progress-fill' style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
)
