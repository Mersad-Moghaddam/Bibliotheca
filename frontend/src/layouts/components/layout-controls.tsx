import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import api from '../../api/client'
import { ThemeToggle } from '../../components/ThemeToggle'
import { Button } from '../../components/ui/button'
import { authStore } from '../../contexts/authStore'
import { useI18n } from '../../shared/i18n/i18n-provider'
import { LanguageToggle } from '../../widgets/language-toggle/language-toggle'

export function LayoutControls({ onLoggedOut }: { onLoggedOut?: () => void }) {
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
