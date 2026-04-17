import { X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef } from 'react'

import { cn } from '../../lib/cn'
import { useI18n } from '../../shared/i18n/i18n-provider'

import { BrandBlock } from './brand-block'
import { LayoutControls } from './layout-controls'
import { NavigationSection } from './navigation-section'

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const labelId = useId()
  const { t } = useI18n()

  const isRtl = useMemo(() => document.documentElement.dir === 'rtl', [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className={cn(
          'fixed top-0 z-50 flex h-dvh w-[min(22.25rem,calc(100%-0.8rem))] flex-col overflow-hidden border-border bg-card px-4 pb-4 pt-[max(0.85rem,env(safe-area-inset-top))] transition-transform duration-250 ease-premium lg:hidden',
          isRtl ? 'right-0 border-l' : 'left-0 border-r',
          open ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="min-w-0">
            <p
              id={labelId}
              className="truncate text-xs font-medium uppercase tracking-wide text-mutedForeground opacity-0"
            >
              {t('nav.workspace')}
            </p>
            <BrandBlock compact />
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface"
            onClick={onClose}
            aria-label={t('common.cancel')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <NavigationSection onNavigate={onClose} />
        <LayoutControls onLoggedOut={onClose} />
      </aside>
    </>
  )
}
