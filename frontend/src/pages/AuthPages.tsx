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
const formCard = 'mx-auto w-full max-w-md space-y-4'

export function Landing() {
  return (
    <div className={wrap}>
      <div className='mx-auto mb-8 flex max-w-6xl justify-end'>
        <ThemeToggle />
      </div>
      <div className='mx-auto grid max-w-6xl gap-6 md:grid-cols-2'>
        <Card className='space-y-6 p-8'>
          <div className='space-y-3'>
            <p className='text-label uppercase text-mutedForeground'>Personal reading workspace</p>
            <h1 className='text-hero text-foreground'>Libro</h1>
            <p className='text-small text-mutedForeground'>Track your library, reading progress, and purchase plans with calm clarity.</p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <Link to='/register'>
              <Button>Get started</Button>
            </Link>
            <Link to='/login'>
              <Button variant='secondary'>Log in</Button>
            </Link>
          </div>
        </Card>
        <Card className='flex items-center justify-center p-8'>
          <img src={heroOpenBook} alt='Open book illustration' className='w-full max-w-lg rounded-lg' />
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
