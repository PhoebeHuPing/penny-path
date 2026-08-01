import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'
import { renderWithProviders } from './test-utils'

describe('LoginPage', () => {
  const mockOnSwitchToRegister = vi.fn()

  it('should render login form', () => {
    renderWithProviders(<LoginPage onSwitchToRegister={mockOnSwitchToRegister} />)
    expect(screen.getByText('PennyPath')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should display error message from store', () => {
    renderWithProviders(<LoginPage onSwitchToRegister={mockOnSwitchToRegister} />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          loading: false,
          error: 'Invalid email or password',
        },
      },
    })
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
  })

  it('should show loading state on button', () => {
    renderWithProviders(<LoginPage onSwitchToRegister={mockOnSwitchToRegister} />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          loading: true,
          error: null,
        },
      },
    })
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('should allow typing in email and password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage onSwitchToRegister={mockOnSwitchToRegister} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'mypassword')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('mypassword')
  })

  it('should call onSwitchToRegister when Create one is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage onSwitchToRegister={mockOnSwitchToRegister} />)

    await user.click(screen.getByRole('button', { name: /create one/i }))
    expect(mockOnSwitchToRegister).toHaveBeenCalled()
  })
})
