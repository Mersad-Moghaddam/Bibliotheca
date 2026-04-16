import axios, { AxiosError } from 'axios'

import { authStore } from '../contexts/authStore'

import { extractData } from './http'
import { RetryableRequestConfig, shouldAttemptTokenRefresh } from './refresh'

const configuredBaseURL = import.meta.env.VITE_API_URL || '/api/v1'
const baseURL = configuredBaseURL.replace(/\/+$/, '')

const api = axios.create({ baseURL, timeout: 15_000 })

let inFlightRefresh: Promise<{ accessToken: string; refreshToken: string }> | null = null

const RETRYABLE_METHODS = new Set(['get', 'head', 'options'])

function shouldRetryRequest(error: AxiosError, request: RetryableRequestConfig) {
  const method = request.method?.toLowerCase() ?? 'get'
  if (!RETRYABLE_METHODS.has(method)) {
    return false
  }
  if (request.url?.includes('/auth/refresh')) {
    return false
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false
  }

  if (!error.response) {
    return true
  }

  const status = error.response.status
  return status >= 500 && status !== 501
}

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

    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (shouldAttemptTokenRefresh(error, refreshToken)) {
      originalRequest._retry = true

      try {
        if (!inFlightRefresh) {
          inFlightRefresh = axios
            .post(`${baseURL}/auth/refresh`, { refreshToken })
            .then((response) => {
              const payload = extractData<{
                tokens: { accessToken: string; refreshToken: string }
              }>(response)
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
        authStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1
    if (originalRequest._retryCount <= 2 && shouldRetryRequest(error, originalRequest)) {
      const backoff = Math.min(300 * 2 ** (originalRequest._retryCount - 1), 1500)
      await new Promise((resolve) => window.setTimeout(resolve, backoff))
      return api(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default api
