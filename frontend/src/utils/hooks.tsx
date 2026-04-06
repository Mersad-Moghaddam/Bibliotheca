import { ReactElement, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { authStore } from '../contexts/authStore'

export function Protected({ children }: { children: ReactElement }) {
  const user = authStore((s) => s.user)
  const hydrated = authStore((s) => s.hydrated)
  const hydrate = authStore((s) => s.hydrate)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrate, hydrated])

  if (!hydrated) return <p>Loading session...</p>
  if (!user) return <Navigate to='/login' replace />
  return children
}
