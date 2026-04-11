import api from '../../../api/client'
import { User } from '../../../types'

export type AuthPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export async function login(payload: AuthPayload) {
  const response = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
    '/auth/login',
    payload
  )
  return response.data
}

export async function register(payload: RegisterPayload) {
  await api.post('/auth/register', payload)
}
