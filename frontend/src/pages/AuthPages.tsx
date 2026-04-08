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
      <div className='mx-auto mb-8 flex max-w-6xl items-center justify-between gap-3'>
        <p className='text-lg font-semibold tracking-tight text-primary'>Libro</p>
        <div className='flex items-center gap-2'><LanguageToggle /><ThemeToggle /></div>
      </div>

      <section className='mx-auto max-w-6xl space-y-20'>
        <div className='grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]'>
          <div className='space-y-6'>
            <p className='eyebrow'>{t('landing.eyebrow')}</p>
            <h1 className='max-w-2xl text-hero text-foreground'>{t('landing.title')}</h1>
            <p className='max-w-xl text-body text-mutedForeground'>{t('landing.subtitle')}</p>
            <div className='flex flex-wrap gap-3'>
              <Link to='/register'><Button>{t('landing.ctaPrimary')}</Button></Link>
              <Link to='/login'><Button variant='secondary'>{t('landing.ctaSecondary')}</Button></Link>
            </div>
          </div>

          <Card className='space-y-4 p-6'>
            <p className='eyebrow'>{t('landing.productPreview')}</p>
            <div className='space-y-3 rounded-xl border border-border bg-surface p-4'>
              <div className='flex items-center justify-between rounded-md border border-border bg-card p-3'><p className='font-medium'>{t('landing.previewCard1Title')}</p><p className='text-sm text-success'>{t('landing.previewCard1Value')}</p></div>
              <div className='rounded-md border border-border bg-card p-3'><p className='text-sm text-mutedForeground'>{t('landing.previewCard2Title')}</p><div className='mt-2 space-y-2'>{[72, 48, 84].map((value, idx) => <div key={idx} className='h-2 rounded-full bg-muted'><div className='h-2 rounded-full bg-primary' style={{ width: `${value}%` }} /></div>)}</div></div>
              <div className='rounded-md border border-border bg-card p-3 text-sm text-mutedForeground'>{t('landing.previewCard3')}</div>
            </div>
          </Card>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          {[0, 1, 2].map((idx) => <Card key={idx} className='p-5'><p className='text-lg font-semibold'>{t(`landing.valueCards.${idx}.title`)}</p><p className='mt-2 text-sm text-mutedForeground'>{t(`landing.valueCards.${idx}.text`)}</p></Card>)}
        </div>

        <Card className='p-6 md:p-8'>
          <h2 className='text-section-title'>{t('landing.workflowTitle')}</h2>
          <div className='mt-5 grid gap-3 md:grid-cols-3 lg:grid-cols-6'>
            {[0, 1, 2, 3, 4, 5].map((idx) => <div key={idx} className='rounded-lg border border-border bg-surface p-3 text-sm'>{t(`landing.workflowSteps.${idx}`)}</div>)}
          </div>
        </Card>

        <div className='grid gap-4 lg:grid-cols-2'>
          <Card className='p-6'><h2 className='text-section-title'>{t('landing.analyticsTitle')}</h2><p className='mt-2 text-sm text-mutedForeground'>{t('landing.analyticsText')}</p><div className='mt-4 grid gap-3 sm:grid-cols-2'>{[0, 1, 2, 3].map((idx) => <div key={idx} className='metric-tile'><p className='text-small text-mutedForeground'>{t(`landing.analyticsMetrics.${idx}.label`)}</p><p className='text-xl font-semibold'>{t(`landing.analyticsMetrics.${idx}.value`)}</p></div>)}</div></Card>
          <Card className='p-6'><h2 className='text-section-title'>{t('landing.useCasesTitle')}</h2><ul className='mt-3 space-y-2 text-sm text-mutedForeground'>{[0, 1, 2, 3, 4].map((idx) => <li key={idx}>• {t(`landing.useCases.${idx}`)}</li>)}</ul></Card>
        </div>

        <Card className='p-6'>
          <h2 className='text-section-title'>{t('landing.trustTitle')}</h2>
          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            {[0, 1, 2].map((idx) => <div key={idx} className='rounded-md border border-border bg-surface p-4 text-sm text-mutedForeground'>“{t(`landing.testimonials.${idx}.quote`)}”<p className='mt-2 text-xs'>{t(`landing.testimonials.${idx}.author`)}</p></div>)}
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='text-section-title'>{t('landing.faqTitle')}</h2>
          <div className='mt-4 space-y-3'>{[0, 1, 2].map((idx) => <div key={idx} className='rounded-md border border-border p-4'><p className='font-medium'>{t(`landing.faq.${idx}.q`)}</p><p className='mt-1 text-sm text-mutedForeground'>{t(`landing.faq.${idx}.a`)}</p></div>)}</div>
        </Card>

        <Card className='space-y-4 p-7 text-center'>
          <h2 className='text-page-title'>{t('landing.finalCtaTitle')}</h2>
          <p className='mx-auto max-w-2xl text-small text-mutedForeground'>{t('landing.finalCtaSubtitle')}</p>
          <div><Link to='/register'><Button>{t('landing.ctaPrimary')}</Button></Link></div>
        </Card>

        <footer className='grid gap-4 border-t border-border pt-6 text-sm text-mutedForeground sm:grid-cols-3'>
          <p>Libro</p>
          <p>{t('landing.footerTagline')}</p>
          <p className='sm:text-right'>{t('landing.footerRights')}</p>
        </footer>
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

  return (<div className={wrap}><div className='mx-auto mb-6 flex w-full max-w-md justify-end gap-2'><LanguageToggle /><ThemeToggle /></div><Card className={formCard}><h1 className='text-page-title'>{t('auth.createAccount')}</h1><form onSubmit={onSubmit} className='space-y-3'><Input name='name' placeholder={t('auth.name')} required /><Input type='email' name='email' placeholder={t('auth.email')} required /><Input type='password' name='password' placeholder={t('auth.password')} minLength={6} required /><Input type='password' name='confirmPassword' placeholder={t('auth.confirmPassword')} minLength={6} required />{err ? <p className='text-small text-destructive'>{err}</p> : null}<Button type='submit' className='w-full'>{t('auth.signUp')}</Button></form><p className='text-small text-mutedForeground'>{t('auth.hasAccount')} <Link to='/login' className='font-medium text-primary'>{t('auth.logIn')}</Link></p></Card></div>)
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

  return (<div className={wrap}><div className='mx-auto mb-6 flex w-full max-w-md justify-end gap-2'><LanguageToggle /><ThemeToggle /></div><Card className={formCard}><h1 className='text-page-title'>{t('auth.welcomeBack')}</h1><form onSubmit={onSubmit} className='space-y-3'><Input type='email' name='email' placeholder={t('auth.email')} required /><Input type='password' name='password' placeholder={t('auth.password')} required />{err ? <p className='text-small text-destructive'>{err}</p> : null}<Button type='submit' className='w-full'>{t('auth.logIn')}</Button></form><p className='text-small text-mutedForeground'>{t('auth.needAccount')} <Link to='/register' className='font-medium text-primary'>{t('auth.signUp')}</Link></p></Card></div>)
}
