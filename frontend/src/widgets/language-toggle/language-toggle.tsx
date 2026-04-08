import { useI18n } from '../../shared/i18n/i18n-provider'
import { Button } from '../../components/ui/button'

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()

  return (
    <div className='inline-flex rounded-md border border-border bg-surface p-1'>
      <Button size='sm' variant={locale === 'en' ? 'primary' : 'ghost'} onClick={() => setLocale('en')}>
        EN
      </Button>
      <Button size='sm' variant={locale === 'fa' ? 'primary' : 'ghost'} onClick={() => setLocale('fa')}>
        FA
      </Button>
    </div>
  )
}
