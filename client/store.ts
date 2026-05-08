import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './modules/counterSlice'
import categoryReducer from './modules/categorySlice'
import expenseReducer from './modules/expenseSlice'


const store = configureStore({
  reducer: {
    counter: counterReducer,
    category: categoryReducer,
    expenses: expenseReducer,
  },
})

export default store
