import { ReactNode } from 'react'
import { Card } from './card'

export function DataToolbar({ children }: { children: ReactNode }) {
  return <Card className='flex flex-col gap-3 md:flex-row md:items-center'>{children}</Card>
}
