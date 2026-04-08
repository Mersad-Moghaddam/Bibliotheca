import { Link, NavLink, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { authStore } from '../contexts/authStore'
import logoWordmark from '../assets/logo-wordmark.svg'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/button'
import { cn } from '../lib/cn'
import { useI18n } from '../shared/i18n/i18n-provider'
import { LanguageToggle } from '../widgets/language-toggle/language-toggle'

const links = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: '◉', section: 'core' },
  { to: '/library', labelKey: 'nav.library', icon: '◉', section: 'core' },
  { to: '/reading', labelKey: 'nav.reading', icon: '◉', section: 'queue' },
  { to: '/finished', labelKey: 'nav.finished', icon: '◉', section: 'queue' },
  { to: '/next', labelKey: 'nav.nextToRead', icon: '◉', section: 'queue' },
  { to: '/wishlist', labelKey: 'nav.wishlist', icon: '◉', section: 'queue' },
  { to: '/profile', labelKey: 'nav.profile', icon: '◉', section: 'account' }
] as const

const groups = [
  { key: 'core', titleKey: 'nav.workspace' },
  { key: 'queue', titleKey: 'nav.readingFlow' },
  { key: 'account', titleKey: 'nav.account' }
] as const

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const logout = authStore((s) => s.logout)
  const { t } = useI18n()

  return (
    <div className='app-shell'>
      <div className='container grid min-h-screen grid-cols-1 gap-6 py-6 lg:grid-cols-[280px_1fr] lg:py-8'>
        <aside className='surface p-4 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:flex lg:flex-col'>
          <Link to='/dashboard' className='mb-5 block rounded-md p-2'>
            <img src={logoWordmark} alt='Libro' className='h-8 w-auto' />
          </Link>

          <div className='space-y-5 overflow-y-auto pr-1'>
            {groups.map((group) => (
              <div key={group.key} className='space-y-2'>
                <p className='eyebrow px-2'>{t(group.titleKey)}</p>
                <nav className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1'>
                  {links.filter((item) => item.section === group.key).map(({ to, labelKey, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors duration-200 ease-premium',
                          isActive
                            ? 'border-primary/20 bg-primary text-primaryForeground shadow-sm'
                            : 'border-transparent text-mutedForeground hover:border-border hover:bg-secondary hover:text-foreground'
                        )
                      }
                    >
                      <span className='text-[10px] opacity-70 group-hover:opacity-100'>{icon}</span>
                      <span>{t(labelKey)}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className='mt-4 flex items-center gap-2 border-t border-border pt-4 lg:mt-auto'>
            <ThemeToggle />
            <LanguageToggle />
            <Button
              variant='secondary'
              className='flex-1'
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
            </Button>
          </div>
        </aside>

        <main className='space-y-6 pb-8'>
          <div className='glass-panel flex flex-wrap items-center justify-between gap-2 px-5 py-3'>
            <div>
              <p className='eyebrow'>{t('nav.platformTitle')}</p>
              <p className='text-sm text-mutedForeground'>{t('nav.platformSubtitle')}</p>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
