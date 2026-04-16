import { AxiosError, AxiosResponse } from 'axios'

type ApiEnvelope<T> = { data: T }

type ApiErrorDetails = Record<string, unknown> | null

export type ApiErrorPayload = {
  code?: string
  message?: string
  details?: ApiErrorDetails
}

export function extractData<T>(response: AxiosResponse<T | ApiEnvelope<T>>): T {
  const payload = response.data as T | ApiEnvelope<T>
  if (payload && typeof payload === 'object' && 'data' in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data
  }
  return payload as T
}

export function parseApiError(error: unknown): ApiErrorPayload {
  const fallback: ApiErrorPayload = { code: 'unknown_error', message: 'Something went wrong.' }
  const axiosError = error as AxiosError | undefined
  const data = axiosError?.response?.data as ApiErrorPayload | undefined
  const status = axiosError?.response?.status
  const isAxiosLikeError = Boolean(
    axiosError && (axiosError.isAxiosError || axiosError.response || axiosError.request)
  )

  if (isAxiosLikeError && !axiosError?.response) {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return {
        code: 'offline',
        message: 'You are offline right now. Reconnect to continue using Libro.',
        details: null
      }
    }

    return {
      code: 'network_error',
      message: 'Unable to reach server. Please check your connection and try again.',
      details: null
    }
  }

  if (!data) {
    if (status) {
      return {
        code: 'http_error',
        message: `Request failed with status ${status}.`,
        details: null
      }
    }
    return fallback
  }
  return {
    code: data.code ?? 'unknown_error',
    message: data.message ?? fallback.message,
    details: data.details ?? null
  }
}
