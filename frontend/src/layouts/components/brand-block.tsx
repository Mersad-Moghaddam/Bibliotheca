import { Link } from 'react-router-dom'

import { useI18n } from '../../shared/i18n/i18n-provider'

export function BrandBlock({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useI18n()

  if (compact) {
    return (
      <Link to="/dashboard" className="min-w-[110px] text-center">
        <p
          className={`truncate text-base font-semibold tracking-tight text-foreground ${locale === 'fa' ? 'brand-wordmark-fa' : ''}`}
        >
          {t('common.appName')}
        </p>
      </Link>
    )
  }

  return (
    <Link to="/dashboard" className="mb-4 rounded-xl px-2 py-2">
      <p className={`truncate text-base font-semibold tracking-tight text-foreground ${locale === 'fa' ? 'brand-wordmark-fa' : ''}`}>
        {t('common.appName')}
      </p>
      <p className="truncate text-[11px] text-mutedForeground">{t('nav.platformSubtitle')}</p>
    </Link>
  )
}
