import { configureStore } from '@reduxjs/toolkit'
import appReducer from './modules/appSlice'
import categoryReducer from './modules/categorySlice'
import expenseReducer from './modules/expenseSlice'


const store = configureStore({
  reducer: {
    app: appReducer,
    category: categoryReducer,
    expenses: expenseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
