export { StatusBadge } from './ui/status-badge'

export function Progress({ value }: { value: number }) {
  const safe = Math.min(100, Math.max(0, value))
  return (
    <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
      <div className='h-full rounded-full bg-primary transition-all duration-200 ease-premium' style={{ width: `${safe}%` }} />
    </div>
  )
}
