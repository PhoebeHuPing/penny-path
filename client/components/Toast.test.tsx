import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import Toast from './Toast'
import { renderWithProviders } from './test-utils'

describe('Toast', () => {
  it('should render nothing when there is no toast', () => {
    const { container } = renderWithProviders(<Toast />)
    expect(container.firstChild).toBeNull()
  })

  it('should render success toast message', () => {
    renderWithProviders(<Toast />, {
      preloadedState: {
        app: {
          initialized: false,
          toast: { message: 'Saved!', type: 'success' },
        },
      },
    })
    expect(screen.getByText('Saved!')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should render error toast message', () => {
    renderWithProviders(<Toast />, {
      preloadedState: {
        app: {
          initialized: false,
          toast: { message: 'Something failed', type: 'error' },
        },
      },
    })
    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('should render info toast message', () => {
    renderWithProviders(<Toast />, {
      preloadedState: {
        app: {
          initialized: false,
          toast: { message: 'Item deleted', type: 'info' },
        },
      },
    })
    expect(screen.getByText('Item deleted')).toBeInTheDocument()
  })
})
