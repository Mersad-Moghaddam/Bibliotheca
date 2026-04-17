import { Menu } from 'lucide-react'

import { ThemeToggle } from '../../components/ThemeToggle'
import { useI18n } from '../../shared/i18n/i18n-provider'

import { BrandBlock } from './brand-block'

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useI18n()

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-card/95 px-3 py-[var(--mobile-header-vpad)] shadow-sm backdrop-blur lg:hidden">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground"
          onClick={onMenuClick}
          aria-label={t('nav.workspace')}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex justify-center">
          <BrandBlock compact />
        </div>
        <div className="flex justify-end">
          <ThemeToggle compact />
        </div>
      </div>
    </header>
  )
}
