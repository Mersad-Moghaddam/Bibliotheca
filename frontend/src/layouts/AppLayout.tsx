import { Link, NavLink, useNavigate } from 'react-router-dom'
import { authStore } from '../contexts/authStore'
import logoWordmark from '../assets/logo-wordmark.svg'

const links = [
  ['/dashboard', 'Dashboard'],
  ['/library', 'Library'],
  ['/reading', 'Reading'],
  ['/finished', 'Finished'],
  ['/next', 'Next'],
  ['/wishlist', 'Wishlist'],
  ['/profile', 'Profile']
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const logout = authStore((s) => s.logout)

  return (
    <div className='min-h-screen pattern'>
      <header className='border-b border-secondary/20 bg-background/90 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center gap-3 p-4'>
          <Link to='/dashboard' className='flex items-center gap-2'>
            <img src={logoWordmark} alt='Libro' className='h-9 w-auto' />
          </Link>
          <nav className='flex flex-wrap gap-2 text-sm text-text'>
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 ${isActive ? 'bg-primary text-[#fdf6ef]' : 'hover:bg-surface/80'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            className='btn ml-auto'
            onClick={() => {
              logout()
              nav('/login')
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className='mx-auto max-w-6xl p-4 md:p-6'>{children}</main>
    </div>
  )
}
