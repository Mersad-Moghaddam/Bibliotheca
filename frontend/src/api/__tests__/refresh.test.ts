import { AxiosError } from 'axios'
import { describe, expect, it } from 'vitest'

import { shouldAttemptTokenRefresh } from '../refresh'

describe('shouldAttemptTokenRefresh', () => {
  it('returns true for a first-time 401 with refresh token', () => {
    const error = {
      response: { status: 401 },
      config: { url: '/books', _retry: false }
    } as unknown as AxiosError

    expect(shouldAttemptTokenRefresh(error, 'token')).toBe(true)
  })

  it('returns false when request already retried', () => {
    const error = {
      response: { status: 401 },
      config: { url: '/books', _retry: true }
    } as unknown as AxiosError

    expect(shouldAttemptTokenRefresh(error, 'token')).toBe(false)
  })

  it('returns false for refresh endpoint to avoid loops', () => {
    const error = {
      response: { status: 401 },
      config: { url: '/auth/refresh', _retry: false }
    } as unknown as AxiosError

    expect(shouldAttemptTokenRefresh(error, 'token')).toBe(false)
  })
})
