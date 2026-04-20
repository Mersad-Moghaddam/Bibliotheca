import api from '../../../api/client'
import { extractData } from '../../../api/http'
import { User } from '../../../types'

export type AuthPayload = {
  mobile: string
  password: string
}

export type RegisterPayload = {
  name: string
  mobile: string
  password: string
  email?: string
}

export async function login(payload: AuthPayload) {
  const response = await api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>(
    '/auth/login',
    payload
  )
  return extractData(response)
}

export async function register(payload: RegisterPayload) {
  await api.post('/auth/register', payload)
}
