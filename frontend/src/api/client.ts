import axios, { AxiosError } from 'axios'

import { authStore } from '../contexts/authStore'
import { analyticsEvents } from '../shared/analytics/events'
import { analytics } from '../shared/analytics/tracker'

import { extractData } from './http'
import { RetryableRequestConfig, shouldAttemptTokenRefresh } from './refresh'

const configuredBaseURL = import.meta.env.VITE_API_URL || '/api/v1'
const baseURL = configuredBaseURL.replace(/\/+$/, '')

const api = axios.create({ baseURL })

let inFlightRefresh: Promise<{ accessToken: string; refreshToken: string }> | null = null

api.interceptors.request.use((c) => {
  const t = authStore.getState().accessToken
  if (t) {
    c.headers.Authorization = `Bearer ${t}`
  }
  return c
})

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const refreshToken = authStore.getState().refreshToken

    if (!shouldAttemptTokenRefresh(error, refreshToken) || !originalRequest) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!inFlightRefresh) {
        inFlightRefresh = axios
          .post(`${baseURL}/auth/refresh`, { refreshToken })
          .then((response) => {
            const payload = extractData<{ tokens: { accessToken: string; refreshToken: string } }>(response)
            const nextAccess = payload?.tokens?.accessToken
            const nextRefresh = payload?.tokens?.refreshToken
            if (!nextAccess || !nextRefresh) {
              throw new Error('refresh payload missing tokens')
            }
            authStore.getState().setTokens(nextAccess, nextRefresh)
            return { accessToken: nextAccess, refreshToken: nextRefresh }
          })
          .finally(() => {
            inFlightRefresh = null
          })
      }

      const tokens = await inFlightRefresh
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      analytics.track(analyticsEvents.forcedLogoutRefreshFailure)
      authStore.getState().logout()
      return Promise.reject(refreshError)
    }
  }
)

export default api
