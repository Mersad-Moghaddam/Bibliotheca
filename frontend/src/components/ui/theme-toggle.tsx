import { useI18n } from '../../shared/i18n/i18n-provider'
import { useTheme } from '../../theme/use-theme'

import { Button } from './button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const dark = theme === 'dark'
  return (
    <Button
      variant="secondary"
      size="sm"
      className="w-full justify-center"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {dark ? t('common.lightMode') : t('common.darkMode')}
    </Button>
  )
}
