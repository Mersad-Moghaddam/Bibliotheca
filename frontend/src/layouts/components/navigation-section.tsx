import { NavLink } from 'react-router-dom'

import { cn } from '../../lib/cn'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { navigationGroups, navigationLinks } from '../navigation-config'

export function NavigationSection({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n()

  return (
    <div className="space-y-5 overflow-y-auto px-1">
      {navigationGroups.map((group) => (
        <div key={group.key} className="space-y-1.5">
          <p className="eyebrow px-2">{t(group.titleKey)}</p>
          <nav className="grid gap-1">
            {navigationLinks
              .filter((item) => item.section === group.key)
              .map(({ to, labelKey, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-all',
                      isActive
                        ? 'bg-primary/14 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]'
                        : 'text-mutedForeground hover:bg-surface hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          'absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-transparent transition-colors',
                          isActive ? 'bg-primary' : 'group-hover:bg-border'
                        )}
                      />
                      <span
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg border bg-card transition-colors',
                          isActive
                            ? 'border-primary/35 text-primary'
                            : 'border-border/70 text-mutedForeground group-hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={cn('truncate', isActive && 'font-medium')}>{t(labelKey)}</span>
                    </>
                  )}
                </NavLink>
              ))}
          </nav>
        </div>
      ))}
    </div>
  )
}
