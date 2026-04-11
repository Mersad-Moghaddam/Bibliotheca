import { zodResolver } from '@hookform/resolvers/zod'
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
import { useI18n } from '../shared/i18n/i18n-provider'
import { useToast } from '../shared/toast/toast-provider'
import { LanguageToggle } from '../widgets/language-toggle/language-toggle'

const wrap = 'app-shell min-h-screen px-4 py-8 md:px-8 md:py-10'
const formCard = 'glass-panel mx-auto w-full max-w-md space-y-4 p-6 md:p-7'

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null

export function Landing() {
  const { t, tm } = useI18n()
  const valueCards = tm<Array<{ title: string; text: string }>>('landing.valueCards') ?? []
  const testimonials = tm<Array<{ quote: string; author: string }>>('landing.testimonials') ?? []

  return (
    <div className={wrap}>
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-3">
        <p className="text-lg font-semibold tracking-tight text-primary">Libro</p>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <section className="mx-auto max-w-6xl space-y-14">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="space-y-6">
            <Badge className="border border-border bg-secondary text-secondaryForeground">
              {t('landing.eyebrow')}
            </Badge>
            <h1 className="max-w-2xl text-hero text-foreground">{t('landing.title')}</h1>
            <p className="max-w-xl text-body text-mutedForeground">{t('landing.subtitle')}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button>{t('landing.ctaPrimary')}</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">{t('landing.ctaSecondary')}</Button>
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {valueCards.map((item) => (
                <Card key={item.title} className="surface-hover space-y-2 p-4">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-mutedForeground">{item.text}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="space-y-4 p-6">
            <p className="eyebrow">{t('landing.productPreview')}</p>
            <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-mutedForeground">{t('landing.previewCard1Title')}</p>
                <p className="mt-2 text-3xl font-semibold text-success">{t('landing.previewCard1Value')}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-4">
                <p className="text-sm font-medium">{t('landing.previewCard2Title')}</p>
                <div className="mt-3 space-y-2">
                  {[72, 45, 88].map((v) => (
                    <div key={v} className="h-2 rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${v}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-mutedForeground">{t('landing.previewCard3')}</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <Card key={idx} className="space-y-3 p-5">
              <p className="text-sm">“{item.quote}”</p>
              <p className="text-xs text-mutedForeground">{item.author}</p>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-section-title">{t('landing.finalCtaTitle')}</h2>
            <p className="mt-1 text-sm text-mutedForeground">{t('landing.finalCtaSubtitle')}</p>
          </div>
          <Link to="/register">
            <Button size="lg">{t('landing.ctaPrimary')}</Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}

export function Register() {
  const nav = useNavigate()
  const { t } = useI18n()
  const toast = useToast()
  const registerMutation = useRegisterMutation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values)
      toast.success(t('auth.signUp'))
      nav('/login')
    } catch (error) {
      const apiError = parseApiError(error)
      if (apiError.code === 'email_already_exists') {
        toast.error(t('auth.emailAlreadyExists'))
        return
      }
      if (apiError.code === 'validation_error') {
        toast.error(t('auth.missingFields'))
        return
      }
      if (apiError.code === 'network_error') {
        toast.error(t('auth.networkFailure'))
        return
      }
      toast.error(apiError.message ?? t('auth.unexpectedServerError'))
    }
  })

  return (
    <div className={wrap}>
      <div className="mx-auto mb-6 flex w-full max-w-md justify-end gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <Card className={formCard}>
        <h1 className="text-page-title">{t('auth.createAccount')}</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Input placeholder={t('auth.name')} {...form.register('name')} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <Input type="email" placeholder={t('auth.email')} {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div>
            <Input type="password" placeholder={t('auth.password')} {...form.register('password')} />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <div>
            <Input
              type="password"
              placeholder={t('auth.confirmPassword')}
              {...form.register('confirmPassword')}
            />
            <FieldError message={form.formState.errors.confirmPassword?.message} />
          </div>
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? t('common.save') : t('auth.signUp')}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export function Login() {
  const nav = useNavigate()
  const { t } = useI18n()
  const toast = useToast()
  const loginMutation = useLoginMutation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values)
      toast.success(t('auth.welcomeBack'))
      nav('/dashboard')
    } catch (error) {
      const apiError = parseApiError(error)
      if (apiError.code === 'invalid_credentials') {
        toast.error(t('auth.invalidCredentials'))
        return
      }
      if (apiError.code === 'validation_error') {
        toast.error(t('auth.missingFields'))
        return
      }
      if (apiError.code === 'network_error') {
        toast.error(t('auth.networkFailure'))
        return
      }
      toast.error(apiError.message ?? t('auth.unexpectedServerError'))
    }
  })

  return (
    <div className={wrap}>
      <div className="mx-auto mb-6 flex w-full max-w-md justify-end gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <Card className={formCard}>
        <h1 className="text-page-title">{t('auth.welcomeBack')}</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Input type="email" placeholder={t('auth.email')} {...form.register('email')} />
            <FieldError message={form.formState.errors.email?.message} />
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
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-primary">
            {t('auth.signUp')}
          </Link>
        </p>
      </Card>
    </div>
  )
}
