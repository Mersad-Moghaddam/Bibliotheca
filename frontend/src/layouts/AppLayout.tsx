import {
  BookCheck,
  BookHeart,
  BookMarked,
  BookOpen,
  CircleUserRound,
  Compass,
  Goal,
  Library,
  LogOut
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
  { to: '/reading', labelKey: 'nav.reading', icon: BookOpen, section: 'queue' },
  { to: '/finished', labelKey: 'nav.finished', icon: BookCheck, section: 'queue' },
  { to: '/next', labelKey: 'nav.nextToRead', icon: BookMarked, section: 'queue' },
  { to: '/wishlist', labelKey: 'nav.wishlist', icon: BookHeart, section: 'queue' },
  { to: '/profile', labelKey: 'nav.profile', icon: CircleUserRound, section: 'account' }
] as const

const groups = [
  { key: 'core', titleKey: 'nav.workspace' },
  { key: 'queue', titleKey: 'nav.readingFlow' },
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
      <div className="container grid min-h-screen grid-cols-1 gap-6 py-5 lg:grid-cols-[300px_1fr] lg:py-7">
        <aside className="surface bg-card/95 p-5 lg:sticky lg:top-7 lg:h-[calc(100vh-3.5rem)] lg:flex lg:flex-col">
          <Link to="/dashboard" className="mb-7 block rounded-2xl border border-border/70 bg-surface/70 px-4 py-3">
            <p className="text-xl font-semibold tracking-tight text-primary">Libro</p>
            <p className="mt-1 text-xs text-mutedForeground">{t('nav.platformSubtitle')}</p>
          </Link>

          <div className="space-y-6 overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group.key} className="space-y-3">
                <p className="eyebrow px-2">{t(group.titleKey)}</p>
                <nav className="grid grid-cols-1 gap-1.5">
                  {links
                    .filter((item) => item.section === group.key)
                    .map(({ to, labelKey, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          cn(
                            'group flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ease-premium',
                            isActive
                              ? 'bg-primary text-primaryForeground shadow-sm'
                              : 'text-mutedForeground hover:bg-secondary hover:text-foreground'
                          )
                        }
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background/70 transition-colors group-hover:border-border">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{t(labelKey)}</span>
                      </NavLink>
                    ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-4 lg:mt-auto">
            <div className="grid gap-2">
              <ThemeToggle />
              <LanguageToggle />
              <Button
                variant="secondary"
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

        <main className="space-y-6 pb-8 page-enter">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
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
