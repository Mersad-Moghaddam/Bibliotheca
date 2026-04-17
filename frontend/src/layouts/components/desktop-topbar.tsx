import { Goal } from 'lucide-react'

import { useI18n } from '../../shared/i18n/i18n-provider'
import { navigationLinks } from '../navigation-config'

export function DesktopTopbar({ pathname }: { pathname: string }) {
  const { t, locale } = useI18n()
  const active = navigationLinks.find((item) => pathname.startsWith(item.to))
  const today = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  return (
    <div className="surface hidden flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 lg:flex">
      <div className="min-w-0">
        <p className="eyebrow">{t('nav.platformTitle')}</p>
        <p className="truncate text-sm font-medium text-foreground">
          {active ? t(active.labelKey) : t('nav.dashboard')}
        </p>
      </div>
      <div className="rounded-xl border border-border/80 bg-surface px-3 py-2 text-right text-xs text-mutedForeground">
        <p>{today}</p>
        <p className="mt-0.5 text-foreground">
          <Goal className="me-1 inline h-3.5 w-3.5" />
          {t('nav.focusMode')}
        </p>
      </div>
    </div>
  )
}
