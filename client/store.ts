import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './modules/counterStore'
import channelReucer from './modules/channelStore'
import expenseReducer from './slices/expenseSlice'


const store = configureStore({
  reducer: {
    counter: counterReducer,
    channel: channelReucer,
    expenses: expenseReducer,
  },
})

export default store
