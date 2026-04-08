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
    <header className='surface flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between'>
      <div className='space-y-2'>
        <h1 className='text-page-title text-foreground'>{title}</h1>
        {description ? <p className='max-w-2xl text-small text-mutedForeground'>{description}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </header>
  )
}
