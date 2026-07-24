import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import api from '../api'
import { triggerToast } from './appSlice'
import type { AppDispatch } from '../store'

export const PAGE_SIZE = 10

export interface Expense {
  id: number
  date: string
  location: string
  amount: number
  category_id: number
}

export interface ExpenseFilters {
  category_id?: number | null
  date_from?: string | null
  date_to?: string | null
  amount_min?: number | null
  amount_max?: number | null
  keyword?: string | null
}

interface ExpenseState {
  expenses: Expense[]
  allExpenses: Expense[] // for chart visualization
  loading: boolean
  page: number
  totalCount: number
  filters: ExpenseFilters
}

const initialState: ExpenseState = {
  expenses: [],
  allExpenses: [],
  loading: false,
  page: 1,
  totalCount: 0,
  filters: {},
}

export const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<{ expenses: Expense[]; total_count: number }>) => {
      state.expenses = action.payload.expenses
      state.totalCount = action.payload.total_count
    },
    setAllExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.allExpenses = action.payload
    },
    addExpenseSuccess: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload)
      state.allExpenses.unshift(action.payload)
      state.totalCount += 1
      // keep page size consistent
      if (state.expenses.length > PAGE_SIZE) {
        state.expenses.pop()
      }
    },
    deleteExpenseSuccess: (state, action: PayloadAction<number>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload)
      state.allExpenses = state.allExpenses.filter((e) => e.id !== action.payload)
      state.totalCount -= 1
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setFilters: (state, action: PayloadAction<ExpenseFilters>) => {
      state.filters = action.payload
    },
    clearFilters: (state) => {
      state.filters = {}
    },
  },
})

export const {
  setExpenses,
  setAllExpenses,
  addExpenseSuccess,
  deleteExpenseSuccess,
  setLoading,
  setPage,
  setFilters,
  clearFilters,
} = expenseSlice.actions

// Build query string from filters
const buildFilterParams = (filters: ExpenseFilters): string => {
  const params = new URLSearchParams()
  if (filters.category_id != null) params.append('category_id', String(filters.category_id))
  if (filters.date_from) params.append('date_from', filters.date_from)
  if (filters.date_to) params.append('date_to', filters.date_to)
  if (filters.amount_min != null) params.append('amount_min', String(filters.amount_min))
  if (filters.amount_max != null) params.append('amount_max', String(filters.amount_max))
  if (filters.keyword) params.append('keyword', filters.keyword)
  return params.toString()
}

// Async actions
export const fetchExpenses = (page = 1, filters?: ExpenseFilters) => async (dispatch: AppDispatch) => {
  dispatch(setLoading(true))
  dispatch(setPage(page))
  try {
    const skip = (page - 1) * PAGE_SIZE
    const filterParams = buildFilterParams(filters || {})
    const separator = filterParams ? '&' : ''
    const res = await api.get(`/api/expenses?skip=${skip}&limit=${PAGE_SIZE}${separator}${filterParams}`)
    dispatch(setExpenses({ expenses: res.data.data.expenses, total_count: res.data.data.total_count }))
  } catch (error) {
    console.error('Failed to fetch expenses:', error)
    dispatch(triggerToast('Failed to fetch expenses', 'error'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const fetchAllExpensesForChart = () => async (dispatch: AppDispatch) => {
  try {
    const res = await api.get('/api/expenses?skip=0&limit=1000')
    dispatch(setAllExpenses(res.data.data.expenses))
  } catch (error) {
    console.error('Failed to fetch all expenses for chart:', error)
  }
}

export const postExpense = (expense: Omit<Expense, 'id'>) => async (dispatch: AppDispatch) => {
  try {
    const res = await api.post('/api/expenses', expense)
    dispatch(addExpenseSuccess(res.data.data.expense))
    dispatch(triggerToast('Transaction recorded successfully!', 'success'))
  } catch (error) {
    console.error('Failed to post expense:', error)
    const axiosError = error as AxiosError<{ detail?: string }>
    const errorMsg = axiosError.response?.data?.detail || 'Failed to add transaction'
    dispatch(triggerToast(errorMsg, 'error'))
  }
}

export const removeExpense = (id: number) => async (dispatch: AppDispatch) => {
  try {
    await api.delete(`/api/expenses/${id}`)
    dispatch(deleteExpenseSuccess(id))
    dispatch(triggerToast('Transaction deleted.', 'info'))
  } catch (error) {
    console.error('Failed to delete expense:', error)
    dispatch(triggerToast('Failed to delete transaction', 'error'))
  }
}

export default expenseSlice.reducer
