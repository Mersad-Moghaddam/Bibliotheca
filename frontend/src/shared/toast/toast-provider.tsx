import { X } from 'lucide-react'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { cn } from '../../lib/cn'

type ToastTone = 'success' | 'error'

type ToastAction = {
  label: string
  onClick: () => void
}

type Toast = {
  id: number
  tone: ToastTone
  message: string
  action?: ToastAction
  durationMs: number
}

type ToastOptions = {
  action?: ToastAction
  durationMs?: number
  dedupeKey?: string
}

type ToastContextType = {
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)
const DEFAULT_DURATION_MS = 4_000
const DEDUPE_WINDOW_MS = 2_000

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeouts = useRef<Map<number, number>>(new Map())
  const recentKeys = useRef<Map<string, number>>(new Map())

  const dismiss = useCallback((id: number) => {
    const timeoutId = timeouts.current.get(id)
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeouts.current.delete(id)
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, message: string, options?: ToastOptions) => {
      const dedupeKey = options?.dedupeKey?.trim()
      if (dedupeKey) {
        const now = Date.now()
        const lastSeen = recentKeys.current.get(dedupeKey) ?? 0
        if (now - lastSeen < DEDUPE_WINDOW_MS) {
          return
        }
        recentKeys.current.set(dedupeKey, now)
      }

      const id = Date.now() + Math.floor(Math.random() * 1000)
      const durationMs = Math.max(1_500, options?.durationMs ?? DEFAULT_DURATION_MS)
      setToasts((prev) => [
        ...prev.slice(-4),
        { id, tone, message, action: options?.action, durationMs }
      ])

      const timeoutId = window.setTimeout(() => dismiss(id), durationMs)
      timeouts.current.set(id, timeoutId)
    },
    [dismiss]
  )

  useEffect(() => {
    const timers = timeouts.current

    return () => {
      for (const timeoutId of timers.values()) {
        window.clearTimeout(timeoutId)
      }
      timers.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      success: (message: string, options?: ToastOptions) => push('success', message, options),
      error: (message: string, options?: ToastOptions) => push('error', message, options),
      dismiss
    }),
    [dismiss, push]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto rounded-md border px-4 py-3 text-sm shadow-lg transition duration-200 animate-in slide-in-from-right-4 fade-in',
              toast.tone === 'success'
                ? 'border-success/50 bg-success/10 text-success'
                : 'border-destructive/50 bg-destructive/10 text-destructive'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">{toast.message}</div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded p-1 opacity-80 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick()
                  dismiss(toast.id)
                }}
                className="mt-2 text-xs font-semibold underline"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
