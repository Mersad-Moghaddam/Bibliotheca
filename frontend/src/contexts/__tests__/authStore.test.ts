import { beforeEach, describe, expect, it } from 'vitest'

import { authStore } from '../authStore'

const storageKey = 'negar.auth'
const legacyStorageKey = 'libro.auth'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    authStore.setState({ user: null, accessToken: null, refreshToken: null, hydrated: false })
  })

  it('sets auth data and persists it', () => {
    authStore
      .getState()
      .setAuth({ id: 'u-1', name: 'Ada', email: 'ada@example.com' }, 'access-1', 'refresh-1')

    const state = authStore.getState()
    expect(state.user?.email).toBe('ada@example.com')
    expect(state.accessToken).toBe('access-1')
    expect(state.refreshToken).toBe('refresh-1')
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
      accessToken: 'access-1',
      refreshToken: 'refresh-1'
    })
  })

  it('refreshes only tokens while keeping user', () => {
    authStore
      .getState()
      .setAuth({ id: 'u-2', name: 'Lin', email: 'lin@example.com' }, 'access-old', 'refresh-old')

    authStore.getState().setTokens('access-new', 'refresh-new')

    const state = authStore.getState()
    expect(state.user?.id).toBe('u-2')
    expect(state.accessToken).toBe('access-new')
    expect(state.refreshToken).toBe('refresh-new')
  })

  it('logs out and clears persisted auth', () => {
    authStore
      .getState()
      .setAuth(
        { id: 'u-3', name: 'Kai', email: 'kai@example.com' },
        'access-token',
        'refresh-token'
      )

    authStore.getState().logout()

    expect(authStore.getState().user).toBeNull()
    expect(authStore.getState().accessToken).toBeNull()
    expect(authStore.getState().refreshToken).toBeNull()
    expect(localStorage.getItem(storageKey)).toBeNull()
    expect(localStorage.getItem(legacyStorageKey)).toBeNull()
  })

  it('hydrates from legacy storage key and migrates to the new key', () => {
    localStorage.setItem(
      legacyStorageKey,
      JSON.stringify({
        user: { id: 'u-4', name: 'Mina', email: 'mina@example.com' },
        accessToken: 'legacy-access',
        refreshToken: 'legacy-refresh'
      })
    )

    authStore.getState().hydrate()

    const state = authStore.getState()
    expect(state.user?.email).toBe('mina@example.com')
    expect(state.accessToken).toBe('legacy-access')
    expect(state.refreshToken).toBe('legacy-refresh')
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}')).toMatchObject({
      accessToken: 'legacy-access',
      refreshToken: 'legacy-refresh'
    })
    expect(localStorage.getItem(legacyStorageKey)).toBeNull()
  })

  it('does not rehydrate session from legacy key after logout', () => {
    localStorage.setItem(
      legacyStorageKey,
      JSON.stringify({
        user: { id: 'u-5', name: 'Nima', email: 'nima@example.com' },
        accessToken: 'legacy-access-2',
        refreshToken: 'legacy-refresh-2'
      })
    )

    authStore.getState().hydrate()
    authStore.getState().logout()
    authStore.getState().hydrate()

    const state = authStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
  })
})
