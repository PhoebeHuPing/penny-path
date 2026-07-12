import { describe, it, expect } from 'vitest'
import store from './store'

describe('store', () => {
  it('should have the expenses reducer', () => {
    const state = store.getState()
    expect(state).toHaveProperty('expenses')
    expect(state.expenses).toMatchObject({ expenses: [], loading: false, allExpenses: [], page: 1, totalCount: 0 })
  })
})
