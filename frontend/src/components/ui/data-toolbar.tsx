import { ReactNode } from 'react'

export function DataToolbar({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 p-1 md:grid-cols-2 xl:grid-cols-5">{children}</div>
}
