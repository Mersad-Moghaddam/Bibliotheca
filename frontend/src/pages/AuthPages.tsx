import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { authStore } from '../contexts/authStore'
import heroOpenBook from '../assets/hero-open-book.svg'

const wrap = 'min-h-screen flex items-center justify-center pattern p-4'
const card = 'card max-w-md w-full space-y-3'

export function Landing() {
  return (
    <div className='min-h-screen pattern'>
      <div className='mx-auto grid max-w-6xl items-center gap-8 p-8 md:grid-cols-2'>
        <div>
          <p className='mb-2 text-sm uppercase tracking-[0.2em] text-secondary'>Your Personal Library</p>
          <h1 className='mb-3 text-5xl text-primary'>Libro</h1>
          <p className='mb-6 text-secondary'>A minimal, warm reading space for your books, progress, and wishlist.</p>
          <div className='flex gap-3'>
            <Link className='btn' to='/register'>
              Get Started
            </Link>
            <Link className='btn !bg-accent !text-text hover:!bg-[#d7b07f]' to='/login'>
              Log In
            </Link>
          </div>
        </div>
        <img src={heroOpenBook} alt='Open book illustration' className='w-full rounded-2xl shadow-soft' />
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
        confirm_password: f.get('confirm_password')
      })
      nav('/login')
    } catch {
      setErr('Registration failed')
    }
  }

  return (
    <div className={wrap}>
      <form onSubmit={onSubmit} className={card}>
        <h1 className='text-3xl text-primary'>Create your Libro account</h1>
        <input className='input' name='name' placeholder='Name' required />
        <input className='input' type='email' name='email' placeholder='Email' required />
        <input className='input' type='password' name='password' placeholder='Password' minLength={6} required />
        <input className='input' type='password' name='confirm_password' placeholder='Confirm password' minLength={6} required />
        {err && <p className='text-sm text-red-700'>{err}</p>}
        <button className='btn w-full'>Sign up</button>
        <p className='text-sm'>
          Already have an account?{' '}
          <Link to='/login' className='underline'>
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
      setAuth(res.data.user, res.data.tokens.access_token, res.data.tokens.refresh_token)
      nav('/dashboard')
    } catch {
      setErr('Invalid credentials')
    }
  }

  return (
    <div className={wrap}>
      <form onSubmit={onSubmit} className={card}>
        <h1 className='text-3xl text-primary'>Welcome back to Libro</h1>
        <input className='input' type='email' name='email' placeholder='Email' required />
        <input className='input' type='password' name='password' placeholder='Password' required />
        {err && <p className='text-sm text-red-700'>{err}</p>}
        <button className='btn w-full'>Log in</button>
        <p className='text-sm'>
          Need an account?{' '}
          <Link to='/register' className='underline'>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
