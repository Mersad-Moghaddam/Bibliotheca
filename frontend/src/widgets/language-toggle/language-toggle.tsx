import { Button } from '../../components/ui/button'
import { useI18n } from '../../shared/i18n/i18n-provider'

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="inline-flex w-full rounded-md border border-border bg-surface p-1" role="group" aria-label="Language">
      <Button
        className="flex-1"
        size="sm"
        variant={locale === 'en' ? 'primary' : 'ghost'}
        onClick={() => setLocale('en')}
      >
        EN
      </Button>
      <Button
        className="flex-1"
        size="sm"
        variant={locale === 'fa' ? 'primary' : 'ghost'}
        onClick={() => setLocale('fa')}
      >
        FA
      </Button>
    </div>
  )
}
