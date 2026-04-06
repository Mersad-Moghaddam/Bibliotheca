import { ReactElement, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { authStore } from '../contexts/authStore'
import { Skeleton } from '../components/ui/skeleton'

export function Protected({ children }: { children: ReactElement }) {
  const user = authStore((s) => s.user)
  const hydrated = authStore((s) => s.hydrated)
  const hydrate = authStore((s) => s.hydrate)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

  if (!hydrated) {
    return (
      <div className='container py-8'>
        <Skeleton className='h-64' />
      </div>
    )
  }

  if (!user) return <Navigate to='/login' replace />
  return children
}
