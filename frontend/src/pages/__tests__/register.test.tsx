import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ToastProvider } from '../../shared/toast/toast-provider'
import { Register } from '../AuthPages'

const { postMock, registerMutateAsyncMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
  registerMutateAsyncMock: vi.fn()
}))

vi.mock('../../api/client', () => ({
  default: {
    post: postMock
  }
}))
vi.mock('../../features/auth/queries/use-auth-mutations', () => ({
  useRegisterMutation: () => ({
    mutateAsync: registerMutateAsyncMock,
    isPending: false
  }),
  useLoginMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  })
}))

vi.mock('../../shared/i18n/i18n-provider', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('Register page', () => {
  beforeEach(() => {
    postMock.mockReset()
    registerMutateAsyncMock.mockReset()
  })

  it('shows duplicate mobile message when backend returns conflict', async () => {
    registerMutateAsyncMock.mockRejectedValue({
      response: {
        status: 409,
        data: { code: 'mobile_already_exists', message: 'An account with this mobile number already exists.' }
      }
    })

    const user = userEvent.setup()
    render(
      <ToastProvider>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </ToastProvider>
    )

    expect(screen.queryByLabelText('Toggle theme')).not.toBeInTheDocument()
    await user.type(screen.getByPlaceholderText('auth.name'), 'Ada')
    await user.type(screen.getByPlaceholderText('auth.mobile'), '09123456789')
    await user.type(screen.getByPlaceholderText('auth.password'), 'strong-pass')
    await user.click(screen.getByRole('button', { name: 'auth.signUp' }))

    await waitFor(() => {
      expect(screen.getByText('auth.mobileAlreadyExists')).toBeInTheDocument()
    })
  })

  it('submits mobile-first registration with optional email omitted', async () => {
    registerMutateAsyncMock.mockResolvedValue({})

    const user = userEvent.setup()
    render(
      <ToastProvider>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </ToastProvider>
    )

    await user.type(screen.getByPlaceholderText('auth.name'), 'Ada')
    await user.type(screen.getByPlaceholderText('auth.mobile'), '09123456789')
    await user.type(screen.getByPlaceholderText('auth.password'), 'strong-pass')
    await user.click(screen.getByRole('button', { name: 'auth.signUp' }))

    await waitFor(() => {
      expect(registerMutateAsyncMock).toHaveBeenCalledWith({
        name: 'Ada',
        mobile: '+989123456789',
        email: '',
        password: 'strong-pass'
      })
    })
  })
})
