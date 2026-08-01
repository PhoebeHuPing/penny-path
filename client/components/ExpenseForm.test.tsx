import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpenseForm from './ExpenseForm'
import { renderWithProviders } from './test-utils'

describe('ExpenseForm', () => {
  const preloadedState = {
    category: {
      categoryList: [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Transport' },
        { id: 3, name: 'Shopping' },
      ],
    },
  }

  it('should render the form with all fields', () => {
    renderWithProviders(<ExpenseForm />, { preloadedState })
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /record transaction/i })).toBeInTheDocument()
  })

  it('should render category options from store', () => {
    renderWithProviders(<ExpenseForm />, { preloadedState })
    const select = screen.getByLabelText(/category/i) as HTMLSelectElement
    const options = select.querySelectorAll('option')
    expect(options).toHaveLength(4) // Select + 3 categories
    expect(options[1].textContent?.trim()).toBe('Food')
    expect(options[2].textContent?.trim()).toBe('Transport')
    expect(options[3].textContent?.trim()).toBe('Shopping')
  })

  it('should show toast when submitting with empty fields', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<ExpenseForm />, { preloadedState })

    // Clear the date field and submit
    const dateInput = screen.getByLabelText(/date/i)
    await user.clear(dateInput)
    await user.click(screen.getByRole('button', { name: /record transaction/i }))

    // Check toast was triggered (location is empty by default)
    const state = store.getState()
    expect(state.app.toast?.type).toBe('error')
  })

  it('should allow typing in form fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExpenseForm />, { preloadedState })

    const locationInput = screen.getByLabelText(/location/i)
    await user.type(locationInput, 'Starbucks')
    expect(locationInput).toHaveValue('Starbucks')

    const amountInput = screen.getByLabelText(/amount/i)
    await user.type(amountInput, '4.50')
    expect(amountInput).toHaveValue(4.5)
  })
})
