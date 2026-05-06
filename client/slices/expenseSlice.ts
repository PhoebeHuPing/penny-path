import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Expense {
  id: string
  description: string
  amount: number
}

interface ExpenseState {
  expenses: Expense[]
}

const initialState: ExpenseState = {
  expenses: [],
}

export const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload)
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload)
    },
  },
})

export const { addExpense, deleteExpense } = expenseSlice.actions
export default expenseSlice.reducer
