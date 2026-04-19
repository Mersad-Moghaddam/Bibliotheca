import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { analyticsEvents } from '../analytics/events'
import { analytics } from '../analytics/tracker'

import { Locale, messages } from './messages'

type TranslationParams = Record<string, string | number>

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  isRtl: boolean
  t: (key: string, params?: TranslationParams) => string
  tm: <T = unknown>(key: string) => T | undefined
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'negar.locale'
const LEGACY_STORAGE_KEY = 'libro.locale'

function getInitialLocale(): Locale {
  const cached = localStorage.getItem(STORAGE_KEY)
  if (cached === 'fa' || cached === 'en') return cached

  const legacyCached = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (legacyCached === 'fa' || legacyCached === 'en') {
    localStorage.setItem(STORAGE_KEY, legacyCached)
    return legacyCached
  }

  return 'en'
}

function getByPath(obj: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) return (acc as Record<string, unknown>)[part]
    return undefined
  }, obj)
}

function interpolate(value: string, params?: TranslationParams): string {
  if (!params) return value
  return Object.entries(params).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), value)
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const setLocaleTracked = (nextLocale: Locale) => {
    setLocale(nextLocale)
    analytics.track(analyticsEvents.localeChanged, { locale: nextLocale })
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
    const isRtl = locale === 'fa'
    document.documentElement.lang = locale
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [locale])

  const value = useMemo<I18nContextType>(
    () => ({
      locale,
      setLocale: setLocaleTracked,
      isRtl: locale === 'fa',
      t: (key, params) => {
        const active = getByPath(messages[locale], key)
        if (typeof active === 'string') return interpolate(active, params)
        const fallback = getByPath(messages.en, key)
        if (typeof fallback === 'string') return interpolate(fallback, params)
        return key
      },
      tm: <T = unknown>(key: string) => {
        const active = getByPath(messages[locale], key)
        if (active !== undefined) return active as T
        const fallback = getByPath(messages.en, key)
        return fallback as T | undefined
      }
    }),
    [locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
