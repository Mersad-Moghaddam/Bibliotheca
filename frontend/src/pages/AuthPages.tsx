import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { ThemeToggle } from '../components/ThemeToggle'
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
  const { t } = useI18n()

  return (
    <div className={wrap}>
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-3">
        <p className="text-lg font-semibold tracking-tight text-primary">Libro</p>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <section className="mx-auto max-w-6xl space-y-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="eyebrow">{t('landing.eyebrow')}</p>
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
          </div>

          <Card className="space-y-4 p-6">
            <p className="eyebrow">{t('landing.productPreview')}</p>
            <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                <p className="font-medium">{t('landing.previewCard1Title')}</p>
                <p className="text-sm text-success">{t('landing.previewCard1Value')}</p>
              </div>
            </div>
          </Card>
        </div>
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
    } catch {
      toast.error(t('auth.registrationFailed'))
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
    } catch {
      toast.error(t('auth.invalidCredentials'))
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
