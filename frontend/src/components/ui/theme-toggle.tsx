import { Button } from './button'
import { useTheme } from '../../theme/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <Button variant='secondary' size='sm' onClick={toggleTheme} aria-label='Toggle theme'>
      {dark ? '☀︎ Light' : '☾ Dark'}
    </Button>
  )
}
