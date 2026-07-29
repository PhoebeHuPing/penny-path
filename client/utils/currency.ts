import store from '../store'

/**
 * Format a number as currency based on the user's currency preference.
 * Uses the Intl.NumberFormat API for locale-aware formatting.
 */
export function formatCurrency(amount: number): string {
  const state = store.getState()
  const currency = state.auth.user?.currency || 'USD'

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Get the currency symbol for the user's preferred currency.
 */
export function getCurrencySymbol(): string {
  const state = store.getState()
  const currency = state.auth.user?.currency || 'USD'

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(0)
    .replace(/\d/g, '')
    .trim()
}
