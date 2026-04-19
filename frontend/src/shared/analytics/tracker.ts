import { AnalyticsEventName } from './events'

type EventPayload = Record<string, string | number | boolean | null | undefined>

type AnalyticsProvider = {
  track: (event: AnalyticsEventName, payload?: EventPayload) => void
}

function sanitizePayload(payload?: EventPayload): EventPayload | undefined {
  if (!payload) return undefined
  const next: EventPayload = {}
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    next[key] = value
  }
  return next
}

const consoleProvider: AnalyticsProvider = {
  track: (event, payload) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[analytics]', event, sanitizePayload(payload))
    }
  }
}

export const analytics: AnalyticsProvider = {
  track: (event, payload) => {
    const sanitized = sanitizePayload(payload)
    const dl = (window as typeof window & { dataLayer?: unknown[] }).dataLayer
    if (Array.isArray(dl)) {
      dl.push({ event, ...sanitized })
      return
    }
    consoleProvider.track(event, sanitized)
  }
}
