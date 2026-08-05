import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'
import { renderWithProviders } from './test-utils'

describe('LoginPage', () => {
  it('should render login form', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('PennyPath')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should display error message from store', () => {
    renderWithProviders(<LoginPage />, {
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
    renderWithProviders(<LoginPage />, {
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
    renderWithProviders(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'mypassword')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('mypassword')
  })

  it('should have a link to register page', () => {
    renderWithProviders(<LoginPage />)
    const link = screen.getByRole('link', { name: /create one/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/register')
  })

  it('should have a link to forgot password page', () => {
    renderWithProviders(<LoginPage />)
    const link = screen.getByRole('link', { name: /forgot password/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/forgot-password')
  })
})
