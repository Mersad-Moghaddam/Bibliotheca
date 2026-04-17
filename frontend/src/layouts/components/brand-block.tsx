import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useI18n } from '../../shared/i18n/i18n-provider'

export function BrandBlock({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n()

  return (
    <Link
      to="/dashboard"
      className={compact ? 'flex min-w-0 items-center gap-2' : 'mb-4 flex items-center gap-2 rounded-xl px-2 py-2'}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold tracking-tight text-foreground">Libro</p>
        <p className="truncate text-[11px] text-mutedForeground">{t('nav.platformSubtitle')}</p>
      </div>
    </Link>
  )
}
