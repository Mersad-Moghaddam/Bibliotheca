import { Link, NavLink, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { authStore } from '../contexts/authStore'
import logoWordmark from '../assets/logo-wordmark.svg'
import { ThemeToggle } from '../components/ThemeToggle'

const links: { to: string; label: string; icon: string }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { to: '/library', label: 'Library', icon: '☰' },
  { to: '/reading', label: 'Reading', icon: '◔' },
  { to: '/finished', label: 'Finished', icon: '✓' },
  { to: '/next', label: 'Next', icon: '→' },
  { to: '/wishlist', label: 'Wishlist', icon: '☆' },
  { to: '/profile', label: 'Profile', icon: '◉' }
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const logout = authStore((s) => s.logout)

  return (
    <div className='app-shell'>
      <div className='mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[250px_1fr] md:gap-6 md:px-6 md:py-6'>
        <aside className='card h-fit p-4 md:sticky md:top-6'>
          <Link to='/dashboard' className='mb-6 block'>
            <img src={logoWordmark} alt='Libro' className='h-8 w-auto' />
          </Link>
          <nav className='space-y-1'>
            {links.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${
                    isActive
                      ? 'bg-primary text-background shadow-soft'
                      : 'text-secondary hover:bg-surface hover:text-text'
                  }`
                }
              >
                <span aria-hidden='true'>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className='mt-6 flex items-center gap-2 border-t border-border pt-4'>
            <ThemeToggle />
            <button
              className='btn-secondary w-full'
              onClick={async () => {
                const refreshToken = authStore.getState().refreshToken
                if (refreshToken) {
                  try {
                    await api.post('/auth/logout', { refreshToken })
                  } catch {
                    // local logout still applies if backend logout fails
                  }
                }
                logout()
                nav('/login')
              }}
            >
              Sign out
            </button>
          </div>
        </aside>
        <main className='space-y-4'>{children}</main>
      </div>
    </div>
  )
}
