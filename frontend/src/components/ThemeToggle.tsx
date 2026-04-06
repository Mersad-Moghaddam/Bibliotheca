import { useTheme } from '../theme/use-theme'

const SunIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' className='h-5 w-5'>
    <circle cx='12' cy='12' r='4' />
    <path d='M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8' />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' className='h-5 w-5'>
    <path d='M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a7 7 0 1 0 9.7 9.7Z' />
  </svg>
)

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type='button'
      className='icon-btn'
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
