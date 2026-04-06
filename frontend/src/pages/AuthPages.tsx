import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { authStore } from '../contexts/authStore'
import heroOpenBook from '../assets/hero-open-book.svg'
import { ThemeToggle } from '../components/ThemeToggle'

const wrap = 'app-shell min-h-screen flex items-center justify-center p-4 md:p-8'
const card = 'card w-full max-w-md space-y-4'

export function Landing() {
  return (
    <div className='app-shell min-h-screen'>
      <div className='mx-auto flex max-w-6xl justify-end px-4 pt-6 md:px-8'>
        <ThemeToggle />
      </div>
      <div className='mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-8 md:py-12'>
        <div className='card'>
          <p className='mb-3 text-xs uppercase tracking-[0.2em] text-secondary'>Your Personal Library</p>
          <h1 className='mb-3 text-5xl text-primary md:text-6xl'>Libro</h1>
          <p className='mb-6 text-secondary'>A calm, modern space for your books, reading progress, and wishlist.</p>
          <div className='flex flex-wrap gap-3'>
            <Link className='btn' to='/register'>
              Get Started
            </Link>
            <Link className='btn-secondary' to='/login'>
              Log In
            </Link>
          </div>
        </div>
        <div className='card flex justify-center'>
          <img src={heroOpenBook} alt='Open book illustration' className='w-full max-w-lg rounded-xl' />
        </div>
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
      setErr('Registration failed')
    }
  }

  return (
    <div className={wrap}>
      <div className='fixed right-4 top-4 z-20'>
        <ThemeToggle />
      </div>
      <form onSubmit={onSubmit} className={card}>
        <h1 className='text-4xl text-primary'>Create your Libro account</h1>
        <input className='input' name='name' placeholder='Name' required />
        <input className='input' type='email' name='email' placeholder='Email' required />
        <input className='input' type='password' name='password' placeholder='Password' minLength={6} required />
        <input className='input' type='password' name='confirmPassword' placeholder='Confirm password' minLength={6} required />
        {err && <p className='error-text text-sm'>{err}</p>}
        <button className='btn w-full'>Sign up</button>
        <p className='text-sm text-secondary'>
          Already have an account?{' '}
          <Link to='/login' className='text-primary underline'>
            Log in
          </Link>
        </p>
      </form>
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
      setErr('Invalid credentials')
    }
  }

  return (
    <div className={wrap}>
      <div className='fixed right-4 top-4 z-20'>
        <ThemeToggle />
      </div>
      <form onSubmit={onSubmit} className={card}>
        <h1 className='text-4xl text-primary'>Welcome back to Libro</h1>
        <input className='input' type='email' name='email' placeholder='Email' required />
        <input className='input' type='password' name='password' placeholder='Password' required />
        {err && <p className='error-text text-sm'>{err}</p>}
        <button className='btn w-full'>Log in</button>
        <p className='text-sm text-secondary'>
          Need an account?{' '}
          <Link to='/register' className='text-primary underline'>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
