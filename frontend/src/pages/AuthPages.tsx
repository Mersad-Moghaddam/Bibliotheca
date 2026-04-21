import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, BookOpenText, Quote, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { parseApiError } from '../api/http'
import { ThemeToggle } from '../components/ThemeToggle'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import {
  LoginFormValues,
  RegisterFormValues,
  loginSchema,
  registerSchema
} from '../features/auth/forms/auth-schemas'
import { useLoginMutation, useRegisterMutation } from '../features/auth/queries/use-auth-mutations'
import { cn } from '../lib/cn'
import { analyticsEvents } from '../shared/analytics/events'
import { analytics } from '../shared/analytics/tracker'
import { useI18n } from '../shared/i18n/i18n-provider'
import { useToast } from '../shared/toast/toast-provider'
import { LanguageToggle } from '../widgets/language-toggle/language-toggle'

const wrap = 'app-shell min-h-dvh w-full px-3 py-4 sm:px-4 sm:py-7 md:px-8 md:py-10'
const formCard = 'mx-auto w-full max-w-md space-y-5 p-4 sm:p-6 md:p-7'

const FieldError = ({ message }: { message?: string }) => {
  const { t } = useI18n()
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-destructive" role="alert" aria-live="polite">
      {message.startsWith('validation.') ? t(message) : message}
    </p>
  )
}

export function Landing() {
  const { t, tm, locale } = useI18n()
  const valueCards = tm<Array<{ title: string; text: string }>>('landing.valueCards') ?? []
  const testimonials = tm<Array<{ quote: string; author: string }>>('landing.testimonials') ?? []
  const productPreviewLabel = t('landing.productPreview')

  return (
    <div className={wrap}>
      <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between gap-3 sm:mb-8">
        <div>
          <p className={cn('text-2xl font-semibold tracking-tight text-foreground', locale === 'fa' && 'brand-wordmark-fa')}>
            {t('common.appName')}
          </p>
          <p className="text-xs text-mutedForeground">{t('landing.eyebrow')}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <section className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        <Card className="grid gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-9">
          <div className="space-y-5">
            {productPreviewLabel ? <Badge className="w-fit">{productPreviewLabel}</Badge> : null}
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-foreground sm:text-hero">{t('landing.title')}</h1>
            <p className="max-w-xl text-sm text-mutedForeground sm:text-body">{t('landing.subtitle')}</p>
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <Link to="/register">
                <Button
                  className="w-full gap-2 sm:w-auto"
                  onClick={() => analytics.track(analyticsEvents.landingCtaClicked, { cta: 'hero_register' })}
                >
                  {t('landing.ctaPrimary')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => analytics.track(analyticsEvents.landingCtaClicked, { cta: 'secondary_login' })}
                >
                  {t('landing.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-surface p-3.5 sm:p-4">
            <p className="text-sm font-medium">{t('landing.previewCard2Title')}</p>
            {[72, 45, 88].map((v, idx) => (
              <div key={idx} className="space-y-1">
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-border bg-card p-2.5 sm:p-3">
              <p className="text-sm text-mutedForeground">{t('landing.previewCard1Title')}</p>
              <p className="text-2xl font-semibold text-success">{t('landing.previewCard1Value')}</p>
            </div>
            <p className="text-sm text-mutedForeground">{t('landing.previewCard3')}</p>
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-3">
          {valueCards.map((item) => (
            <Card key={item.title} className="surface-hover space-y-2 p-4 sm:p-5">
              <BookOpenText className="h-4 w-4 text-primary" />
              <p className="text-base font-semibold">{item.title}</p>
              <p className="text-sm text-mutedForeground">{item.text}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <Card key={idx} className="space-y-3 p-4 sm:p-5">
              <Quote className="h-4 w-4 text-mutedForeground" />
              <p className="text-sm">{item.quote}</p>
              <p className="text-xs text-mutedForeground">{item.author}</p>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col items-start justify-between gap-4 p-4 sm:p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-section-title">{t('landing.finalCtaTitle')}</h2>
            <p className="mt-1 text-sm text-mutedForeground">{t('landing.finalCtaSubtitle')}</p>
          </div>
          <Link to="/register">
            <Button
              size="lg"
              className="w-full gap-2 sm:w-auto"
              onClick={() => analytics.track(analyticsEvents.landingCtaClicked, { cta: 'final_register' })}
            >
              <Sparkles className="h-4 w-4" />
              {t('landing.ctaPrimary')}
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className={formCard}>
      <div className={cn('border-b border-border pb-3', subtitle ? 'space-y-2' : undefined)}>
        <h1 className="text-page-title">{title}</h1>
        {subtitle ? <p className="text-small text-mutedForeground">{subtitle}</p> : null}
      </div>
      {children}
    </Card>
  )
}

export function Register() {
  const nav = useNavigate()
  const { t, locale } = useI18n()
  const toast = useToast()
  const registerMutation = useRegisterMutation()
  const isPersianMobileField = locale === 'fa'

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', mobile: '', email: '', password: '' }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values)
      analytics.track(analyticsEvents.registerSucceeded)
      toast.success(t('auth.signUp'))
      nav('/login')
    } catch (error) {
      const apiError = parseApiError(error)
      analytics.track(analyticsEvents.registerFailed, { code: apiError.code ?? 'unknown_error' })
      if (apiError.code === 'mobile_already_exists') return toast.error(t('auth.mobileAlreadyExists'))
      if (apiError.code === 'email_already_exists') return toast.error(t('auth.emailAlreadyExists'))
      if (apiError.code === 'validation_error') return toast.error(t('auth.missingFields'))
      if (apiError.code === 'network_error') return toast.error(t('auth.networkFailure'))
      toast.error(apiError.message ?? t('auth.unexpectedServerError'))
    }
  })

  return (
    <div className={cn(wrap, 'flex w-full flex-col items-center justify-center gap-3 sm:gap-4')}>
      <AuthFrame title={t('auth.createAccount')}>
        <form onSubmit={onSubmit} className="space-y-3" noValidate aria-busy={registerMutation.isPending}>
          <div>
            <Input aria-label={t('auth.name')} placeholder={t('auth.name')} {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <Input
              type="tel"
              inputMode="tel"
              dir={isPersianMobileField ? 'ltr' : undefined}
              textAlign={isPersianMobileField ? 'end' : undefined}
              aria-label={t('auth.mobile')}
              placeholder={t('auth.mobile')}
              {...form.register('mobile')}
            />
            <FieldError message={form.formState.errors.mobile?.message} />
          </div>
          <div>
            <Input type="email" placeholder={t('auth.emailOptional')} {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div>
            <Input type="password" placeholder={t('auth.password')} {...form.register('password')} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? t('common.save') : t('auth.signUp')}
          </Button>
          <p className="text-small text-mutedForeground">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-medium text-primary underline-offset-2 hover:underline">
              {t('auth.logIn')}
            </Link>
          </p>
        </form>
      </AuthFrame>
    </div>
  )
}

export function Login() {
  const nav = useNavigate()
  const { t, locale } = useI18n()
  const toast = useToast()
  const loginMutation = useLoginMutation()
  const isPersianMobileField = locale === 'fa'

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '', password: '' }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)
      analytics.track(analyticsEvents.loginSucceeded)
      toast.success(t('auth.welcomeBack'))
      nav('/dashboard')
    } catch (error) {
      const apiError = parseApiError(error)
      analytics.track(analyticsEvents.loginFailed, { code: apiError.code ?? 'unknown_error' })
      if (apiError.code === 'invalid_credentials') return toast.error(t('auth.invalidCredentials'))
      if (apiError.code === 'validation_error') return toast.error(t('auth.missingFields'))
      if (apiError.code === 'network_error') return toast.error(t('auth.networkFailure'))
      toast.error(apiError.message ?? t('auth.unexpectedServerError'))
    }
  })

  return (
    <div className={cn(wrap, 'flex w-full flex-col items-center justify-center gap-3 sm:gap-4')}>
      <AuthFrame title={t('auth.welcomeBack')}>
        <form onSubmit={onSubmit} className="space-y-3" noValidate aria-busy={loginMutation.isPending}>
          <div>
            <Input
              type="tel"
              inputMode="tel"
              dir={isPersianMobileField ? 'ltr' : undefined}
              textAlign={isPersianMobileField ? 'end' : undefined}
              aria-label={t('auth.mobile')}
              placeholder={t('auth.mobile')}
              {...form.register('mobile')}
            />
            <FieldError message={form.formState.errors.mobile?.message} />
          </div>
          <div>
            <Input type="password" placeholder={t('auth.password')} {...form.register('password')} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? t('common.save') : t('auth.logIn')}
          </Button>
        </form>
        <p className="text-small text-mutedForeground">
          {t('auth.needAccount')}{' '}
          <Link to="/register" className="font-medium text-primary underline-offset-2 hover:underline">
            {t('auth.signUp')}
          </Link>
        </p>
      </AuthFrame>
    </div>
  )
}
