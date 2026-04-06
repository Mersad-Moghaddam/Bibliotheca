import { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className='flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm md:flex-row md:items-start md:justify-between'>
      <div className='space-y-2'>
        <h1 className='text-page-title text-foreground'>{title}</h1>
        {description ? <p className='max-w-2xl text-small text-mutedForeground'>{description}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </header>
  )
}
