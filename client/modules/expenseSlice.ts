import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export interface Expense {
  id: string
  date: string
  location: string
  amount: number
  category_id: number
}

interface ExpenseState {
  expenses: Expense[]
  loading: boolean
}

const initialState: ExpenseState = {
  expenses: [],
  loading: false,
}

export const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload
    },
    addExpenseSuccess: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload)
    },
    deleteExpenseSuccess: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    }
  },
})

export const { setExpenses, addExpenseSuccess, deleteExpenseSuccess, setLoading } = expenseSlice.actions

// Async actions
export const fetchExpenses = () => async (dispatch: any) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.get('/api/expenses')
    dispatch(setExpenses(res.data.data.expenses))
  } catch (error) {
    console.error('Failed to fetch expenses:', error)
  } finally {
    dispatch(setLoading(false))
  }
}

export const postExpense = (expense: Omit<Expense, 'id'>) => async (dispatch: any) => {
  try {
    const res = await axios.post('/api/expenses', expense)
    dispatch(addExpenseSuccess(res.data.data.expense))
  } catch (error) {
    console.error('Failed to post expense:', error)
  }
}

export const removeExpense = (id: string) => async (dispatch: any) => {
  try {
    await axios.delete(`/api/expenses/${id}`)
    dispatch(deleteExpenseSuccess(id))
  } catch (error) {
    console.error('Failed to delete expense:', error)
  }
}

export default expenseSlice.reducer
