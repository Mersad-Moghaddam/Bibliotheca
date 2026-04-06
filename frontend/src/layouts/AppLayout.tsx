import { Link, NavLink, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { authStore } from '../contexts/authStore'
import logoWordmark from '../assets/logo-wordmark.svg'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/button'
import { cn } from '../lib/cn'

const links: { to: string; label: string; icon: string }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { to: '/library', label: 'Library', icon: '☰' },
  { to: '/reading', label: 'Reading', icon: '◔' },
  { to: '/finished', label: 'Finished', icon: '✓' },
  { to: '/next', label: 'Next To Read', icon: '→' },
  { to: '/wishlist', label: 'Wishlist', icon: '☆' },
  { to: '/profile', label: 'Profile', icon: '◉' }
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const logout = authStore((s) => s.logout)

  return (
    <div className='app-shell'>
      <div className='container grid min-h-screen grid-cols-1 gap-6 py-6 lg:grid-cols-[264px_1fr] lg:py-8'>
        <aside className='rounded-lg border border-border bg-card p-4 shadow-sm lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:flex lg:flex-col'>
          <Link to='/dashboard' className='mb-4 block rounded-md p-2'>
            <img src={logoWordmark} alt='Libro' className='h-8 w-auto' />
          </Link>
          <nav className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1'>
            {links.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ease-premium',
                    isActive ? 'bg-primary text-primaryForeground shadow-sm' : 'text-mutedForeground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className='mt-4 flex items-center gap-2 border-t border-border pt-4 lg:mt-auto'>
            <ThemeToggle />
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
              Sign out
            </Button>
          </div>
        </aside>
        <main className='space-y-6 pb-8'>{children}</main>
      </div>
    </div>
  )
}
