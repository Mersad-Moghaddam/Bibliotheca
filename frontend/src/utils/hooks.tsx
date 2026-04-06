import { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { authStore } from '../contexts/authStore'

export function Protected({children}:{children:ReactElement}){
  const user=authStore(s=>s.user)
  if(!user) return <Navigate to='/login' replace />
  return children
}
