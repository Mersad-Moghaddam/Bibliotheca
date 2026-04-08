import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { authStore } from '../contexts/authStore'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useI18n } from '../shared/i18n/i18n-provider'
import { LanguageToggle } from '../widgets/language-toggle/language-toggle'

const wrap = 'app-shell min-h-screen px-4 py-8 md:px-8 md:py-10'
const formCard = 'glass-panel mx-auto w-full max-w-md space-y-4 p-6 md:p-7'

export function Landing() {
  const { t } = useI18n()

  return (
    <div className={wrap}>
      <div className='mx-auto mb-10 flex max-w-6xl items-center justify-end gap-2'>
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <section className='mx-auto max-w-6xl space-y-14'>
        <div className='grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]'>
          <div className='space-y-6'>
            <p className='eyebrow'>{t('landing.eyebrow')}</p>
            <h1 className='max-w-2xl text-hero text-foreground'>{t('landing.title')}</h1>
            <p className='max-w-xl text-body text-mutedForeground'>{t('landing.subtitle')}</p>
            <div className='flex flex-wrap gap-3'>
              <Link to='/register'><Button>{t('landing.ctaPrimary')}</Button></Link>
              <Link to='/login'><Button variant='secondary'>{t('landing.ctaSecondary')}</Button></Link>
            </div>
          </div>

          <Card className='space-y-5 p-6 md:p-8'>
            <p className='eyebrow'>{t('landing.productPreview')}</p>
            <div className='rounded-xl border border-border bg-surface p-5'>
              <p className='text-base font-semibold'>{t('landing.previewTitle')}</p>
              <div className='mt-4 space-y-2'>
                <div className='rounded-md border border-border bg-card px-3 py-2 text-sm'>{t('landing.previewStats1')}</div>
                <div className='rounded-md border border-border bg-card px-3 py-2 text-sm'>{t('landing.previewStats2')}</div>
                <div className='rounded-md border border-border bg-card px-3 py-2 text-sm'>{t('landing.previewStats3')}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className='grid gap-8 lg:grid-cols-2'>
          <Card className='space-y-4 p-6'>
            <h2 className='text-section-title'>{t('landing.benefitsTitle')}</h2>
            <ul className='space-y-2 text-small text-mutedForeground'>
              {[0, 1, 2].map((idx) => <li key={idx}>• {t(`landing.benefits.${idx}`)}</li>)}
            </ul>
          </Card>
          <Card className='space-y-4 p-6'>
            <h2 className='text-section-title'>{t('landing.workflowTitle')}</h2>
            <ol className='space-y-2 text-small text-mutedForeground'>
              {[0, 1, 2].map((idx) => <li key={idx}>{idx + 1}. {t(`landing.workflowSteps.${idx}`)}</li>)}
            </ol>
          </Card>
        </div>

        <Card className='space-y-4 p-7 text-center'>
          <h2 className='text-page-title'>{t('landing.finalCtaTitle')}</h2>
          <p className='mx-auto max-w-2xl text-small text-mutedForeground'>{t('landing.finalCtaSubtitle')}</p>
          <div><Link to='/register'><Button>{t('landing.ctaPrimary')}</Button></Link></div>
        </Card>
      </section>
    </div>
  )
}

export function Register() {
  const nav = useNavigate()
  const [err, setErr] = useState('')
  const { t } = useI18n()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      await api.post('/auth/register', {
        name: f.get('name'),
        email: f.get('email'),
        password: f.get('password'),
        confirmPassword: f.get('confirmPassword')
      })
      nav('/login')
    } catch {
      setErr(t('auth.registrationFailed'))
    }
  }

  return (
    <div className={wrap}>
      <div className='mx-auto mb-6 flex w-full max-w-md justify-end gap-2'><LanguageToggle /><ThemeToggle /></div>
      <Card className={formCard}>
        <h1 className='text-page-title'>{t('auth.createAccount')}</h1>
        <form onSubmit={onSubmit} className='space-y-3'>
          <Input name='name' placeholder={t('auth.name')} required />
          <Input type='email' name='email' placeholder={t('auth.email')} required />
          <Input type='password' name='password' placeholder={t('auth.password')} minLength={6} required />
          <Input type='password' name='confirmPassword' placeholder={t('auth.confirmPassword')} minLength={6} required />
          {err ? <p className='text-small text-destructive'>{err}</p> : null}
          <Button type='submit' className='w-full'>{t('auth.signUp')}</Button>
        </form>
        <p className='text-small text-mutedForeground'>{t('auth.hasAccount')} <Link to='/login' className='font-medium text-primary'>{t('auth.logIn')}</Link></p>
      </Card>
    </div>
  )
}

export function Login() {
  const nav = useNavigate()
  const setAuth = authStore((s) => s.setAuth)
  const [err, setErr] = useState('')
  const { t } = useI18n()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      const res = await api.post('/auth/login', { email: f.get('email'), password: f.get('password') })
      setAuth(res.data.user, res.data.tokens.accessToken, res.data.tokens.refreshToken)
      nav('/dashboard')
    } catch {
      setErr(t('auth.invalidCredentials'))
    }
  }

  return (
    <div className={wrap}>
      <div className='mx-auto mb-6 flex w-full max-w-md justify-end gap-2'><LanguageToggle /><ThemeToggle /></div>
      <Card className={formCard}>
        <h1 className='text-page-title'>{t('auth.welcomeBack')}</h1>
        <form onSubmit={onSubmit} className='space-y-3'>
          <Input type='email' name='email' placeholder={t('auth.email')} required />
          <Input type='password' name='password' placeholder={t('auth.password')} required />
          {err ? <p className='text-small text-destructive'>{err}</p> : null}
          <Button type='submit' className='w-full'>{t('auth.logIn')}</Button>
        </form>
        <p className='text-small text-mutedForeground'>{t('auth.needAccount')} <Link to='/register' className='font-medium text-primary'>{t('auth.signUp')}</Link></p>
      </Card>
    </div>
  )
}
