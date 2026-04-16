import { AxiosError, InternalAxiosRequestConfig } from 'axios'

const REFRESH_PATH_SUFFIX = '/auth/refresh'

export type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  _retryCount?: number
}

export function shouldAttemptTokenRefresh(error: AxiosError, refreshToken: string | null): boolean {
  const originalRequest = error.config as RetryableRequestConfig | undefined
  const status = error.response?.status
  const requestURL = originalRequest?.url ?? ''

  if (!refreshToken) {
    return false
  }

  if (status !== 401 || originalRequest?._retry) {
    return false
  }

  if (requestURL.endsWith(REFRESH_PATH_SUFFIX)) {
    return false
  }

  return true
}
