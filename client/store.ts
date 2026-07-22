import { configureStore } from '@reduxjs/toolkit'
import appReducer from './modules/appSlice'
import authReducer from './modules/authSlice'
import categoryReducer from './modules/categorySlice'
import expenseReducer from './modules/expenseSlice'

const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    category: categoryReducer,
    expenses: expenseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
