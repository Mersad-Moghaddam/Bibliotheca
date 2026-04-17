import { create } from 'zustand'

import { User } from '../types'

type State = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  hydrated: boolean
  setAuth: (u: User, a: string, r: string) => void
  setTokens: (a: string, r: string) => void
  logout: () => void
  hydrate: () => void
}

const STORAGE_KEY = 'negar.auth'
const LEGACY_STORAGE_KEY = 'libro.auth'

export const authStore = create<State>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }))
    set({ user, accessToken, refreshToken })
  },
  setTokens: (accessToken, refreshToken) => {
    const state = get()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: state.user, accessToken, refreshToken })
    )
    set({ accessToken, refreshToken })
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    set({ user: null, accessToken: null, refreshToken: null })
  },
  hydrate: () => {
    try {
      const current = localStorage.getItem(STORAGE_KEY)
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      const raw = current ?? legacy
      if (!raw) {
        set({ hydrated: true })
        return
      }
      const parsed = JSON.parse(raw)
      localStorage.setItem(STORAGE_KEY, raw)
      if (!current && legacy) {
        localStorage.removeItem(LEGACY_STORAGE_KEY)
      }
      set({
        user: parsed.user ?? null,
        accessToken: parsed.accessToken ?? null,
        refreshToken: parsed.refreshToken ?? null,
        hydrated: true
      })
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      set({ hydrated: true })
    }
  }
}))
