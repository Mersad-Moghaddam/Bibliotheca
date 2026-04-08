import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { authStore } from '../contexts/authStore'
import heroOpenBook from '../assets/hero-open-book.svg'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'

const wrap = 'app-shell min-h-screen px-4 py-8 md:px-8 md:py-10'
const formCard = 'glass-panel mx-auto w-full max-w-md space-y-4 p-6 md:p-7'

const highlights = [
  {
    title: 'Focused planning',
    description: 'Organize backlog, current titles, and next reads with a clean queue model.'
  },
  {
    title: 'Frictionless tracking',
    description: 'Update page progress in seconds and maintain momentum with minimal clicks.'
  },
  {
    title: 'Smart purchasing',
    description: 'Capture wishlist links and expected prices before you buy your next title.'
  }
]

const metrics = [
  { label: 'Dashboard clarity', value: '4 views' },
  { label: 'Status pipeline', value: 'Library → Reading → Finished' },
  { label: 'Built for focus', value: 'Low-noise UI' }
]

export function Landing() {
  return (
    <div className={wrap}>
      <div className='mx-auto mb-8 flex max-w-6xl justify-end'>
        <ThemeToggle />
      </div>
      <div className='mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <Card className='space-y-7 p-7 md:p-9'>
          <div className='space-y-4'>
            <p className='text-label uppercase text-mutedForeground'>Modern reading workspace</p>
            <h1 className='text-hero text-foreground'>Reading operations, designed like premium software.</h1>
            <p className='max-w-2xl text-body text-mutedForeground'>
              Libro helps serious readers run their personal reading system with calm structure, excellent readability, and an intentional workflow from backlog to completion.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            {metrics.map((metric) => (
              <div key={metric.label} className='rounded-lg border border-border bg-surface p-3'>
                <p className='text-xs uppercase tracking-[0.08em] text-mutedForeground'>{metric.label}</p>
                <p className='mt-1 text-sm font-semibold text-foreground'>{metric.value}</p>
              </div>
            ))}
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link to='/register'>
              <Button>Start for free</Button>
            </Link>
            <Link to='/login'>
              <Button variant='secondary'>Log in</Button>
            </Link>
          </div>
        </Card>

        <Card className='space-y-4 p-7 md:p-9'>
          <img src={heroOpenBook} alt='Open book illustration' className='w-full rounded-lg border border-border bg-surface p-4' />
          <div className='space-y-3'>
            {highlights.map((item) => (
              <div key={item.title} className='rounded-lg border border-border bg-card p-4'>
                <h2 className='text-sm font-semibold'>{item.title}</h2>
                <p className='mt-1 text-small text-mutedForeground'>{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function Register() {
  const nav = useNavigate()
  const [err, setErr] = useState('')

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
      setErr('Registration failed. Please check your details.')
    }
  }

  return (
    <div className={wrap}>
      <div className='mx-auto mb-6 flex w-full max-w-md justify-end'>
        <ThemeToggle />
      </div>
      <Card className={formCard}>
        <h1 className='text-page-title'>Create your account</h1>
        <form onSubmit={onSubmit} className='space-y-3'>
          <Input name='name' placeholder='Name' required />
          <Input type='email' name='email' placeholder='Email' required />
          <Input type='password' name='password' placeholder='Password' minLength={6} required />
          <Input type='password' name='confirmPassword' placeholder='Confirm password' minLength={6} required />
          {err ? <p className='text-small text-destructive'>{err}</p> : null}
          <Button type='submit' className='w-full'>
            Sign up
          </Button>
        </form>
        <p className='text-small text-mutedForeground'>
          Already have an account?{' '}
          <Link to='/login' className='font-medium text-primary'>
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}

export function Login() {
  const nav = useNavigate()
  const setAuth = authStore((s) => s.setAuth)
  const [err, setErr] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      const res = await api.post('/auth/login', { email: f.get('email'), password: f.get('password') })
      setAuth(res.data.user, res.data.tokens.accessToken, res.data.tokens.refreshToken)
      nav('/dashboard')
    } catch {
      setErr('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className={wrap}>
      <div className='mx-auto mb-6 flex w-full max-w-md justify-end'>
        <ThemeToggle />
      </div>
      <Card className={formCard}>
        <h1 className='text-page-title'>Welcome back</h1>
        <form onSubmit={onSubmit} className='space-y-3'>
          <Input type='email' name='email' placeholder='Email' required />
          <Input type='password' name='password' placeholder='Password' required />
          {err ? <p className='text-small text-destructive'>{err}</p> : null}
          <Button type='submit' className='w-full'>
            Log in
          </Button>
        </form>
        <p className='text-small text-mutedForeground'>
          Need an account?{' '}
          <Link to='/register' className='font-medium text-primary'>
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
