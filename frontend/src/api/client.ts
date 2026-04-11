import axios from 'axios'

import { authStore } from '../contexts/authStore'

import { extractData } from './http'

const configuredBaseURL = import.meta.env.VITE_API_URL || '/api/v1'
const baseURL = configuredBaseURL.replace(/\/+$/, '')

const api = axios.create({ baseURL })

api.interceptors.request.use((c) => {
  const t = authStore.getState().accessToken
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config
    const refreshToken = authStore.getState().refreshToken

    if (err.response?.status === 401 && !orig?._retry && refreshToken) {
      orig._retry = true
      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
        const payload = extractData<{ tokens: { accessToken: string; refreshToken: string } }>(res)
        const nextAccess = payload?.tokens?.accessToken
        const nextRefresh = payload?.tokens?.refreshToken
        if (!nextAccess || !nextRefresh) {
          throw new Error('refresh payload missing tokens')
        }
        authStore.getState().setTokens(nextAccess, nextRefresh)
        orig.headers.Authorization = `Bearer ${nextAccess}`
        return api(orig)
      } catch {
        authStore.getState().logout()
      }
    }

    return Promise.reject(err)
  }
)

export default api
