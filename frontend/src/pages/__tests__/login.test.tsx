import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authStore } from '../../contexts/authStore'
import { ToastProvider } from '../../shared/toast/toast-provider'
import { Login } from '../AuthPages'

const { navigateMock, postMock, loginMutateAsyncMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  postMock: vi.fn(),
  loginMutateAsyncMock: vi.fn()
}))

vi.mock('../../api/client', () => ({
  default: {
    post: postMock
  }
}))
vi.mock('../../features/auth/queries/use-auth-mutations', () => ({
  useLoginMutation: () => ({
    mutateAsync: loginMutateAsyncMock,
    isPending: false
  })
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

describe('Login page', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    postMock.mockReset()
    loginMutateAsyncMock.mockReset()
    localStorage.clear()
    authStore.setState({ user: null, accessToken: null, refreshToken: null, hydrated: false })
  })

  it('submits credentials, stores auth, and redirects on success', async () => {
    loginMutateAsyncMock.mockImplementation(async (payload: { mobile: string; password: string }) => {
      expect(payload).toEqual({
        mobile: '+989123456789',
        password: 'strong-pass'
      })
      authStore.getState().setAuth({ id: 'u-1', mobile: '+989123456789', name: 'Ada' }, 'acc', 'ref')
      return {
        data: {
          user: { id: 'u-1', mobile: '+989123456789', name: 'Ada' },
          tokens: { accessToken: 'acc', refreshToken: 'ref' }
        }
      }
    })

    const user = userEvent.setup()
    render(
      <ToastProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.queryByLabelText('Toggle theme')).not.toBeInTheDocument()
    await user.type(screen.getByPlaceholderText('auth.mobile'), '09123456789')
    await user.type(screen.getByPlaceholderText('auth.password'), 'strong-pass')
    await user.click(screen.getByRole('button', { name: 'auth.logIn' }))

    await waitFor(() => {
      expect(loginMutateAsyncMock).toHaveBeenCalled()
      expect(authStore.getState().accessToken).toBe('acc')
      expect(navigateMock).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows invalid credential message for 401 response', async () => {
    loginMutateAsyncMock.mockRejectedValue({
      response: { status: 401, data: { code: 'invalid_credentials', message: 'bad credentials' } }
    })

    const user = userEvent.setup()
    render(
      <ToastProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </ToastProvider>
    )

    await user.type(screen.getByPlaceholderText('auth.mobile'), '09123456789')
    await user.type(screen.getByPlaceholderText('auth.password'), 'strong-pass')
    await user.click(screen.getByRole('button', { name: 'auth.logIn' }))

    await waitFor(() => {
      expect(screen.getByText('auth.invalidCredentials')).toBeInTheDocument()
    })
  })
})
