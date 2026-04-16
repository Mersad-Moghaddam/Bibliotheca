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
  Menu,
  Sparkles,
  X
} from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
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

function Brand() {
  const { t } = useI18n()
  return (
    <Link to="/dashboard" className="mb-4 flex items-center gap-2 rounded-xl px-2 py-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sparkles className="h-4 w-4" />
      </span>
      <div>
        <p className="text-lg font-semibold tracking-tight text-foreground">Libro</p>
        <p className="text-[11px] text-mutedForeground">{t('nav.platformSubtitle')}</p>
      </div>
    </Link>
  )
}

function Navigation() {
  const { t } = useI18n()

  return (
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
  )
}

function Controls({ onLoggedOut }: { onLoggedOut?: () => void }) {
  const nav = useNavigate()
  const logout = authStore((s) => s.logout)
  const { t } = useI18n()

  return (
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
            onLoggedOut?.()
            nav('/login')
          }}
        >
          {t('nav.signOut')}
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useI18n()
  const location = useLocation()
  const active = links.find((item) => location.pathname.startsWith(item.to))
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/80 bg-card/95 px-3 py-2.5 shadow-sm backdrop-blur lg:hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground"
        onClick={onMenuClick}
        aria-label={t('nav.platformTitle')}
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">Libro</p>
          <p className="truncate text-[11px] text-mutedForeground">{active ? t(active.labelKey) : t('nav.dashboard')}</p>
        </div>
      </Link>
      <ThemeToggle compact />
      </div>
    </header>
  )
}

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const labelId = useId()

  const isRtl = useMemo(() => document?.documentElement.dir === 'rtl', [])

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
          'fixed inset-0 z-40 bg-background/55 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
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
          'fixed top-0 z-50 flex h-dvh w-[min(22rem,calc(100%-1rem))] flex-col overflow-hidden rounded-none border-border bg-card p-4 transition-transform duration-250 ease-premium lg:hidden',
          isRtl ? 'right-0 border-l' : 'left-0 border-r',
          open ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
          <div className="min-w-0">
            <p id={labelId} className="truncate text-base font-semibold text-foreground">
              Libro
            </p>
            <p className="text-xs text-mutedForeground">Workspace</p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Navigation />
        <Controls onLoggedOut={onClose} />
      </aside>
    </>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { t, locale } = useI18n()
  const [open, setOpen] = useState(false)

  const active = links.find((item) => location.pathname.startsWith(item.to))
  const today = new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date())

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false)
      }
    }

    if (desktopQuery.matches) {
      setOpen(false)
    }

    desktopQuery.addEventListener('change', onDesktop)
    return () => desktopQuery.removeEventListener('change', onDesktop)
  }, [])

  return (
    <div className="app-shell">
      <div className="container mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-3 px-3 pb-3 pt-[4.6rem] sm:px-4 sm:pb-4 sm:pt-[4.6rem] lg:grid-cols-[268px_minmax(0,1fr)] lg:gap-5 lg:px-6 lg:py-5">
        <Drawer open={open} onClose={() => setOpen(false)} />

        <aside className="surface hidden p-3.5 lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:flex-col lg:overflow-hidden lg:p-4">
          <Brand />
          <Navigation />
          <Controls />
        </aside>

        <main className="min-w-0 space-y-4 pb-6 page-enter lg:space-y-5 lg:pb-8">
          <MobileHeader onMenuClick={() => setOpen(true)} />

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
          {children}
        </main>
      </div>
    </div>
  )
}
