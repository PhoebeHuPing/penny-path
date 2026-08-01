import { describe, it, expect } from 'vitest'
import reducer, {
  setIncomes,
  addIncomeSuccess,
  deleteIncomeSuccess,
  setLoading,
  setPage,
  Income,
  INCOME_PAGE_SIZE,
} from './incomeSlice'

const initialState = {
  incomes: [],
  loading: false,
  page: 1,
  totalCount: 0,
}

describe('incomeSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setIncomes', () => {
    const incomes: Income[] = [
      { id: 1, date: '2026-07-01', source: 'Salary', amount: 5000 },
      { id: 2, date: '2026-07-15', source: 'Freelance', amount: 1200 },
    ]
    const state = reducer(initialState, setIncomes({ incomes, total_count: 2 }))
    expect(state.incomes).toEqual(incomes)
    expect(state.totalCount).toBe(2)
  })

  it('should handle addIncomeSuccess', () => {
    const newIncome: Income = {
      id: 1,
      date: '2026-07-20',
      source: 'Bonus',
      amount: 500,
    }
    const state = reducer(initialState, addIncomeSuccess(newIncome))
    expect(state.incomes).toHaveLength(1)
    expect(state.incomes[0]).toEqual(newIncome)
    expect(state.totalCount).toBe(1)
  })

  it('should handle deleteIncomeSuccess', () => {
    const stateWithIncomes = {
      ...initialState,
      incomes: [
        { id: 1, date: '2026-07-01', source: 'Salary', amount: 5000 },
        { id: 2, date: '2026-07-15', source: 'Freelance', amount: 1200 },
      ],
      totalCount: 2,
    }
    const state = reducer(stateWithIncomes, deleteIncomeSuccess(1))
    expect(state.incomes).toHaveLength(1)
    expect(state.incomes[0].id).toBe(2)
    expect(state.totalCount).toBe(1)
  })

  it('should handle setLoading', () => {
    const state = reducer(initialState, setLoading(true))
    expect(state.loading).toBe(true)
  })

  it('should handle setPage', () => {
    const state = reducer(initialState, setPage(3))
    expect(state.page).toBe(3)
  })

  it('should not exceed INCOME_PAGE_SIZE when adding incomes', () => {
    const manyIncomes = Array.from({ length: INCOME_PAGE_SIZE }, (_, i) => ({
      id: i + 1,
      date: '2026-07-01',
      source: `Source ${i + 1}`,
      amount: 100,
    }))
    const fullState = { ...initialState, incomes: manyIncomes, totalCount: INCOME_PAGE_SIZE }
    const extra: Income = { id: INCOME_PAGE_SIZE + 1, date: '2026-07-20', source: 'Extra', amount: 50 }
    const state = reducer(fullState, addIncomeSuccess(extra))
    expect(state.incomes).toHaveLength(INCOME_PAGE_SIZE)
    expect(state.incomes[0].id).toBe(INCOME_PAGE_SIZE + 1)
  })
})
