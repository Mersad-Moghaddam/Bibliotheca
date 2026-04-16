import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

const MAX_QUERY_RETRIES = 2

function isNetworkError(error: unknown) {
  const axiosError = error as AxiosError | undefined
  return Boolean(axiosError?.isAxiosError && !axiosError.response)
}

function shouldRetryQuery(failureCount: number, error: unknown) {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false
  }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false
  }

  if (isNetworkError(error)) {
    return true
  }

  const status = (error as AxiosError | undefined)?.response?.status
  if (!status) {
    return false
  }

  return status >= 500 && status !== 501
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetryQuery,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 0
    }
  }
})
