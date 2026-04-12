import {
  BookCheck,
  BookHeart,
  BookMarked,
  BookOpen,
  CircleUserRound,
  Compass,
  Goal,
  Library,
  LogOut,
  Sparkles
} from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import api from '../api/client'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/button'
import { authStore } from '../contexts/authStore'
import { cn } from '../lib/cn'
import { useI18n } from '../shared/i18n/i18n-provider'
import { LanguageToggle } from '../widgets/language-toggle/language-toggle'

const links = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: Compass, section: 'core' },
  { to: '/library', labelKey: 'nav.library', icon: Library, section: 'core' },
  { to: '/reading', labelKey: 'nav.reading', icon: BookOpen, section: 'flow' },
  { to: '/finished', labelKey: 'nav.finished', icon: BookCheck, section: 'flow' },
  { to: '/next', labelKey: 'nav.nextToRead', icon: BookMarked, section: 'flow' },
  { to: '/wishlist', labelKey: 'nav.wishlist', icon: BookHeart, section: 'flow' },
  { to: '/profile', labelKey: 'nav.profile', icon: CircleUserRound, section: 'account' }
] as const

const groups = [
  { key: 'core', titleKey: 'nav.workspace' },
  { key: 'flow', titleKey: 'nav.readingFlow' },
  { key: 'account', titleKey: 'nav.account' }
] as const

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const logout = authStore((s) => s.logout)
  const location = useLocation()
  const { t, locale } = useI18n()

  const active = links.find((item) => location.pathname.startsWith(item.to))
  const today = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  return (
    <div className="app-shell">
      <div className="container grid min-h-screen grid-cols-1 gap-5 py-4 lg:grid-cols-[268px_1fr] lg:py-5">
        <aside className="surface p-3.5 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:flex lg:flex-col lg:p-4">
          <Link to="/dashboard" className="mb-4 flex items-center gap-2 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">Libro</p>
              <p className="text-[11px] text-mutedForeground">{t('nav.platformSubtitle')}</p>
            </div>
          </Link>

          <div className="space-y-5 overflow-y-auto px-1">
            {groups.map((group) => (
              <div key={group.key} className="space-y-1.5">
                <p className="eyebrow px-2">{t(group.titleKey)}</p>
                <nav className="grid gap-1">
                  {links
                    .filter((item) => item.section === group.key)
                    .map(({ to, labelKey, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
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

          <div className="mt-4 border-t border-border pt-3 lg:mt-auto">
            <div className="grid gap-2">
              <ThemeToggle />
              <LanguageToggle />
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={async () => {
                  const refreshToken = authStore.getState().refreshToken
                  if (refreshToken) {
                    try {
                      await api.post('/auth/logout', { refreshToken })
                    } catch {
                      // fallback local logout
                    }
                  }
                  logout()
                  nav('/login')
                }}
              >
                {t('nav.signOut')}
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        <main className="space-y-5 pb-8 page-enter">
          <div className="surface flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
            <div>
              <p className="eyebrow">{t('nav.platformTitle')}</p>
              <p className="text-sm font-medium text-foreground">
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
          {children}
        </main>
      </div>
    </div>
  )
}
