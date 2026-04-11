import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authStore } from '../../contexts/authStore'
import { ToastProvider } from '../../shared/toast/toast-provider'
import { Login } from '../AuthPages'

const { navigateMock, postMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  postMock: vi.fn()
}))

vi.mock('../../api/client', () => ({
  default: {
    post: postMock
  }
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock
  }
})

vi.mock('../../shared/i18n/i18n-provider', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

vi.mock('../../components/ThemeToggle', () => ({
  ThemeToggle: () => null
}))

describe('Login page', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    postMock.mockReset()
    localStorage.clear()
    authStore.setState({ user: null, accessToken: null, refreshToken: null, hydrated: false })
  })

  it('submits credentials, stores auth, and redirects on success', async () => {
    postMock.mockResolvedValue({
      data: {
        user: { id: 'u-1', email: 'ada@example.com', name: 'Ada' },
        tokens: { accessToken: 'acc', refreshToken: 'ref' }
      }
    })

    const user = userEvent.setup()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    )

    await user.type(screen.getByPlaceholderText('auth.email'), 'ada@example.com')
    await user.type(screen.getByPlaceholderText('auth.password'), 'strong-pass')
    await user.click(screen.getByRole('button', { name: 'auth.logIn' }))

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith('/auth/login', {
        email: 'ada@example.com',
        password: 'strong-pass'
      })
      expect(authStore.getState().accessToken).toBe('acc')
      expect(navigateMock).toHaveBeenCalledWith('/dashboard')
    })
  })
})
